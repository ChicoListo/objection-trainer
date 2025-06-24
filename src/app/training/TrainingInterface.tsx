'use client'

import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Sparkles, RefreshCw, Send, ChevronRight } from 'lucide-react';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

type Feedback = {
    score: number;
    feedback_points: string[];
} | null;

export default function TrainingInterface() {
    const [objection, setObjection] = useState<string>('');
    const [userResponse, setUserResponse] = useState<string>('');
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFeedbackLoading, setIsFeedbackLoading] = useState<boolean>(false);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = false;
            recognition.lang = 'es-ES';
            recognition.interimResults = false;

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setUserResponse(prev => prev ? `${prev} ${transcript}` : transcript);
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error("Error de reconocimiento de voz:", event.error);
                setError("Hubo un error con el micrófono. Inténtalo de nuevo.");
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const handleGenerateObjection = async () => {
        setIsLoading(true);
        setError(null);
        setObjection('');
        setUserResponse('');
        setFeedback(null);

        try {
            const supabase = createClient();
            const { data, error } = await supabase.functions.invoke('generate-objection');

            if (error) throw error;
            setObjection(data.objection);
        } catch (err) {
            console.error("Error al generar objeción:", err);
            setError("No se pudo generar la objeción. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendResponse = async () => {
        if (!userResponse.trim()) {
            setError("Por favor, escribe o graba una respuesta.");
            return;
        }

        setIsFeedbackLoading(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: feedbackData, error: functionError } = await supabase.functions.invoke('get-feedback', {
                body: { objection, userResponse }
            });

            if (functionError) throw functionError;
            setFeedback(feedbackData.feedback);

            // Guardar en base de datos
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuario no autenticado");

            const { data: sessionRecord, error: sessionError } = await supabase
                .from('training_sessions')
                .insert({ user_id: user.id })
                .select('id')
                .single();

            if (sessionError || !sessionRecord) throw new Error("Error al guardar sesión");

            const { data: objectionRecord, error: objectionError } = await supabase
                .from('objections')
                .insert({
                    session_id: sessionRecord.id,
                    objection_text: objection,
                    ai_model_source: 'Mistral-7B'
                })
                .select('id')
                .single();

            if (objectionError || !objectionRecord) throw new Error("Error al guardar objeción");

            await supabase.from('responses').insert({
                objection_id: objectionRecord.id,
                user_response_text: userResponse,
                ai_feedback_text: JSON.stringify(feedbackData.feedback)
            });

        } catch (err: any) {
            console.error("Error en el proceso de feedback:", err);
            setError(err.message || "Error al procesar tu respuesta");
        } finally {
            setIsFeedbackLoading(false);
        }
    };

    const handleToggleListening = () => {
        if (!recognitionRef.current) {
            setError("Reconocimiento de voz no soportado en tu navegador");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 p-4">
            {/* Header Section */}
            <div className="text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    Entrenador de Objeciones
                </h1>
                <p className="text-gray-400 mt-2">
                    Practica con objeciones reales y recibe feedback instantáneo
                </p>
            </div>

            {/* Generate Button */}
            <button
                onClick={handleGenerateObjection}
                disabled={isLoading || isFeedbackLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all
          ${isLoading ? 'bg-indigo-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
          text-white shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed`}
            >
                {isLoading ? (
                    <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Generando objeción...
                    </>
                ) : (
                    <>
                        <Sparkles className="h-5 w-5" />
                        Generar Nueva Objeción
                    </>
                )}
            </button>

            {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-lg animate-fade-in">
                    {error}
                </div>
            )}

            {/* Objection Card */}
            {objection && (
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 animate-fade-in">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-600/20 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-lg text-gray-200 italic">"{objection}"</p>
                    </div>
                </div>
            )}

            {/* Response Section */}
            {objection && !feedback && (
                <div className="space-y-6 animate-fade-in">
                    <div className="relative">
                        <textarea
                            value={userResponse}
                            onChange={(e) => setUserResponse(e.target.value)}
                            placeholder="Escribe tu respuesta aquí o usa el micrófono..."
                            rows={5}
                            className="w-full p-4 pr-14 bg-gray-800/50 backdrop-blur-sm text-gray-200 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition placeholder-gray-500"
                            disabled={isFeedbackLoading}
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button
                                onClick={handleToggleListening}
                                className={`p-2 rounded-lg ${isListening ? 'bg-red-600/80 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}
                                disabled={isFeedbackLoading}
                                aria-label={isListening ? "Detener grabación" : "Iniciar grabación"}
                            >
                                {isListening ? (
                                    <MicOff className="h-5 w-5 text-white" />
                                ) : (
                                    <Mic className="h-5 w-5 text-white" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleSendResponse}
                        disabled={isFeedbackLoading || !userResponse}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all
              ${isFeedbackLoading ? 'bg-green-700' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'}
              text-white shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                        {isFeedbackLoading ? (
                            <>
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                Analizando respuesta...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Enviar Respuesta
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Feedback Section */}
            {feedback && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 p-6 rounded-xl animate-fade-in space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-600/20 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white">Feedback de la IA</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/30 p-6 rounded-lg text-center">
                            <p className="text-gray-400 mb-2">Puntuación</p>
                            <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                {feedback.score}/10
                            </div>
                            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                    style={{ width: `${feedback.score * 10}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-gray-900/30 p-6 rounded-lg">
                            <p className="text-gray-400 mb-3">Puntos a mejorar:</p>
                            <ul className="space-y-3">
                                {feedback.feedback_points.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <ChevronRight className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-200">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateObjection}
                        className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="h-5 w-5" />
                        Practicar con otra objeción
                    </button>
                </div>
            )}
        </div>
    );
}