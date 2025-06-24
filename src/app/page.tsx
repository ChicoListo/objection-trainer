// src/app/page.tsx
import Link from 'next/link';
import { Target, BarChart, Zap, MoveRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Botón CTA dinámico
  const ctaButton = user ? (
    <Link
      href="/training"
      className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
    >
      Continuar Entrenamiento <MoveRight className="ml-3 h-5 w-5" />
    </Link>
  ) : (
    <Link
      href="/login"
      className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
    >
      Empieza Gratis Ahora <MoveRight className="ml-3 h-5 w-5" />
    </Link>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 mb-6">
              Domina Cualquier Objeción <span className="text-white">con IA</span>
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-300 leading-relaxed">
              Tu <span className="font-semibold text-blue-300">coach de ventas personalizado</span> que genera objeciones realistas,
              analiza tus respuestas y te ayuda a mejorar <span className="italic">en tiempo real</span>.
            </p>
            <div className="mt-10 flex justify-center">
              {ctaButton}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transforma tus habilidades de ventas</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Un sistema de entrenamiento diseñado por expertos en ventas y potenciado por IA
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 mx-auto">
                <Target size={28} className="opacity-90" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Objeciones Reales</h3>
              <p className="text-gray-400 text-center">
                Nuestra IA aprende de miles de objeciones reales para ofrecerte los desafíos más auténticos que enfrentarás en el campo.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 mx-auto">
                <Zap size={28} className="opacity-90" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Feedback Instantáneo</h3>
              <p className="text-gray-400 text-center">
                Analiza estructura, tono y contenido de tus respuestas con métricas detalladas y sugerencias mejoradas por IA.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 transition-all duration-300 hover:-translate-y-2">
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 mx-auto">
                <BarChart size={28} className="opacity-90" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Progreso Medible</h3>
              <p className="text-gray-400 text-center">
                Dashboard completo con estadísticas, tendencias y áreas de mejora para que veas tu evolución día a día.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <blockquote className="text-xl md:text-2xl italic text-gray-300 mb-8">
            "En solo 2 semanas usando Objection Trainer AI, mi tasa de cierre aumentó un 35%.
            Las objeciones que antes me paralizaban ahora son oportunidades que sé cómo manejar."
          </blockquote>
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold mr-4">
              AM
            </div>
            <div className="text-left">
              <p className="font-medium">Alejandro Martínez</p>
              <p className="text-gray-500 text-sm">Director de Ventas, TechSolutions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-indigo-900/30"></div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para dominar el arte de manejar objeciones?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Únete a cientos de profesionales de ventas que ya están cerrando más tratos con confianza.
          </p>
          <div className="flex justify-center">
            {ctaButton}
          </div>
          <p className="mt-6 text-gray-400 text-sm">
            Sin tarjeta de crédito requerida • Prueba gratuita de 7 días
          </p>
        </div>
      </div>
    </div>
  );
}