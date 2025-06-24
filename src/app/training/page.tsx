// src/app/training/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TrainingInterface from "./TrainingInterface";

// Esta parte se ejecuta en el servidor para proteger la ruta.
export default async function TrainingPage() {
    const supabase = createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/login"); // Si no hay usuario, fuera de aquí.
    }

    // Si el usuario está logueado, mostramos el componente interactivo.
    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-2">Sesión de Entrenamiento</h1>
            <p className="text-gray-500 mb-8">
                Presiona el botón para recibir una nueva objeción y practica tu respuesta.
            </p>
            <TrainingInterface />
        </div>
    );
}