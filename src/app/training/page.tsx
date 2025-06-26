// src/app/training/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatInterface from "./ChatInterface"; // Importa el nuevo componente

// Esta parte se ejecuta en el servidor para proteger la ruta.
export default async function TrainingPage() {
    const supabase = createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/login"); // Si no hay usuario, fuera de aquí.
    }

    // Simplemente renderizamos la interfaz de chat, que contiene toda la lógica.
    return (
        // Quitamos el padding y el max-w para que el chat ocupe el espacio
        <div>
            <ChatInterface />
        </div>
    );
}