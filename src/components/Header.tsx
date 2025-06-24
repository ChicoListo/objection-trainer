// src/components/Header.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogOut, History, BrainCircuit } from 'lucide-react';

export default async function Header() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <header className="bg-gray-800 border-b border-gray-700">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                    <BrainCircuit className="text-blue-400" />
                    ObjectionTrainer
                </Link>
                {user && (
                    <div className="flex items-center gap-4">
                        <Link href="/training" className="text-gray-300 hover:text-white transition-colors">Entrenamiento</Link>
                        <Link href="/history" className="text-gray-300 hover:text-white transition-colors">Historial</Link>
                        <form action="/auth/logout" method="post">
                            <button className="flex items-center gap-2 p-2 bg-red-600 rounded-lg text-sm hover:bg-red-700" title="Cerrar sesión">
                                <LogOut size={18} />
                            </button>
                        </form>
                    </div>
                )}
            </nav>
        </header>
    );
}