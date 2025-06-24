// src/app/history/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertCircle } from 'lucide-react';

// Para parsear el feedback de forma segura
type Feedback = {
    score: number;
    feedback_points: string[];
};

export default async function HistoryPage() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // Consulta compleja para obtener todo el historial
    const { data: history, error } = await supabase
        .from('responses')
        .select(`
            *,
            objections (
                objection_text,
                created_at
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching history:", error);
        return <p className="text-red-500">No se pudo cargar el historial.</p>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Historial de Sesiones</h1>
            {history.length === 0 ? (
                <div className="text-center py-10 bg-gray-800 rounded-lg">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-500" />
                    <h3 className="mt-2 text-sm font-semibold text-white">No hay historial</h3>
                    <p className="mt-1 text-sm text-gray-400">Completa una sesión de entrenamiento para verla aquí.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {history.map((item: any) => {
                        const feedback: Feedback | null = JSON.parse(item.ai_feedback_text);
                        const objectionDate = new Date(item.objections.created_at).toLocaleString('es-ES');

                        return (
                            <div key={item.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <p className="text-sm text-gray-400 mb-2">{objectionDate}</p>
                                <div className="mb-4">
                                    <p className="font-semibold text-gray-300">Objeción:</p>
                                    <p className="italic">"{item.objections.objection_text}"</p>
                                </div>
                                <div className="mb-4">
                                    <p className="font-semibold text-gray-300">Tu Respuesta:</p>
                                    <p className="bg-gray-700 p-2 rounded">{item.user_response_text}</p>
                                </div>
                                {feedback && (
                                    <div className="bg-gray-900 border border-green-700 p-4 rounded-lg">
                                        <h4 className="font-bold text-lg mb-2">Feedback Recibido (Puntuación: {feedback.score}/10)</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            {feedback.feedback_points.map((point, index) => (
                                                <li key={index}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}