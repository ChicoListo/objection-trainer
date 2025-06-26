// src/app/training/ChatInterface.tsx
'use client'

import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";
import { Bot, User, Send, BrainCircuit, Star } from 'lucide-react';

// ... (Tipos y declaración global se mantienen igual)
type Message = {
    id: string;
    sender: 'ai' | 'user' | 'feedback';
    content: string | React.ReactNode;
};

type FeedbackContent = {
    score: number;
    feedback_points: string[];
};

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(true); // CORRECCIÓN: Empezamos en true porque la primera objeción se está cargando.
    const chatEndRef = useRef<HTMLDivElement>(null);
    const hasFetchedInitialObjection = useRef(false); // CORRECCIÓN: useRef para evitar doble fetch.

    const addMessage = (sender: 'ai' | 'user' | 'feedback', content: string | React.ReactNode) => {
        const newMessage: Message = { id: crypto.randomUUID(), sender, content };
        setMessages(prev => [...prev, newMessage]);
    };

    // CORRECCIÓN: useEffect más robusto para la carga inicial.
    useEffect(() => {
        if (!hasFetchedInitialObjection.current) {
            hasFetchedInitialObjection.current = true;
            handleGenerateObjection();
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleGenerateObjection = async () => {
        setIsLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase.functions.invoke('generate-objection');
        
        if (error) {
            addMessage('ai', "Lo siento, tuve un problema al generar la objeción. Inténtalo de nuevo.");
        } else {
            addMessage('ai', data.objection);
        }
        setIsLoading(false);
    };

    const handleSendUserResponse = async () => {
        if (!userInput.trim() || isLoading) return;

        const lastAiMessage = messages.filter(m => m.sender === 'ai' && typeof m.content === 'string').pop();
        if (!lastAiMessage) {
            addMessage('feedback', "Error: No se encontró una objeción válida. Intenta generar una nueva.");
            return;
        }
        const currentObjection = lastAiMessage.content as string;
        
        const userResponseText = userInput;
        addMessage('user', userResponseText);
        setUserInput(''); // CORRECCIÓN: Limpiamos el input inmediatamente.
        setIsLoading(true); // CORRECCIÓN: Activamos el estado de carga para el feedback.

        const supabase = createClient();
        const { data: feedbackData, error: functionError } = await supabase.functions.invoke('get-feedback', {
            body: { objection: currentObjection, userResponse: userResponseText }
        });
        
        if (functionError) {
            addMessage('feedback', "No se pudo obtener el feedback. Intenta con otra respuesta.");
        } else {
            const feedbackContent = feedbackData.feedback as FeedbackContent;
            saveSession(currentObjection, userResponseText, feedbackContent);
            addMessage('feedback', <FeedbackCard feedback={feedbackContent} />);
        }
        
        // CORRECCIÓN: El estado de carga se desactiva aquí, al final de la operación.
        setIsLoading(false);
    };

    const saveSession = async (objection: string, userResponse: string, feedback: FeedbackContent) => {
        // ... (la función saveSession ya estaba bien)
        const supabase = createClient();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: sessionRecord } = await supabase.from('training_sessions').insert({ user_id: user.id }).select('id').single();
            if (sessionRecord) {
                const { data: objectionRecord } = await supabase.from('objections').insert({ session_id: sessionRecord.id, objection_text: objection }).select('id').single();
                if (objectionRecord) {
                    await supabase.from('responses').insert({ objection_id: objectionRecord.id, user_response_text: userResponse, ai_feedback_text: JSON.stringify(feedback) });
                }
            }
        } catch (error) {
            console.error("Error al guardar la sesión:", error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                {/* CORRECCIÓN: Indicador de carga mejorado */}
                {isLoading && messages.length > 0 && <ChatMessage message={{ id: 'loading', sender: 'ai', content: '...' }} />}
                {isLoading && messages.length === 0 && <p className="text-center text-gray-400">Generando la primera objeción...</p>}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-700">
                <div className="relative">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendUserResponse()}
                        placeholder={isLoading ? "Esperando respuesta de la IA..." : "Escribe tu respuesta aquí..."}
                        className="w-full p-3 pr-20 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendUserResponse}
                        disabled={isLoading || !userInput.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ... (Los componentes ChatMessage y FeedbackCard se mantienen igual, ya estaban bien)
const ChatMessage = ({ message }: { message: Message }) => {
    // ...
    const isAi = message.sender === 'ai';
    const isFeedback = message.sender === 'feedback';

    if (isFeedback) return <>{message.content}</>;

    return (
        <div className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
            {isAi && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Bot size={20} className="text-white" />
                </div>
            )}
            <div className={`px-4 py-2 rounded-lg max-w-lg ${isAi ? 'bg-gray-700 text-white' : 'bg-blue-600 text-white'}`}>
                <p>{message.content as string}</p>
            </div>
            {!isAi && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <User size={20} className="text-white" />
                </div>
            )}
        </div>
    );
};
const FeedbackCard = ({ feedback }: { feedback: FeedbackContent }) => {
    // ...
    return (
    <div className="bg-gray-700 border border-green-500 p-4 my-2 rounded-lg space-y-3 animate-fade-in">
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <BrainCircuit size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Análisis de la IA</h3>
        </div>
        <div className="flex items-baseline justify-center gap-2">
            <p className="text-5xl font-bold text-green-400">{feedback.score}</p>
            <p className="text-xl text-gray-400">/ 10</p>
        </div>
        <div>
            <p className="font-semibold text-gray-300 mb-2">Puntos clave:</p>
            <ul className="list-none space-y-2">
                {feedback.feedback_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                        <Star size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
    )
};