import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const supabase = createClient();

    // Obtenemos los datos del usuario.
    const { data, error } = await supabase.auth.getUser();

    // Si hay un error o no hay usuario, lo redirigimos a la página de login.
    if (error || !data?.user) {
        redirect("/login");
    }

    // Si llegamos aquí, el usuario está autenticado.
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Página de Perfil Protegida</h1>
            <p className="mt-4">Hola, <span className="font-semibold">{data.user.email}</span></p>
            <p>¡Has accedido a una ruta segura!</p>

            {/* Añadiremos un botón de logout más adelante */}
        </div>
    );
}