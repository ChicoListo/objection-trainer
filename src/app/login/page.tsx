'use client'

import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                router.push('/training')
                router.refresh()
            }
        })

        return () => subscription?.unsubscribe()
    }, [supabase, router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Objection Trainer AI</h1>
                    <p className="text-blue-100/90 font-light">Tu asistente personal para dominar objeciones de ventas</p>
                </div>

                {/* Auth Container */}
                <div className="p-8">
                    <Auth
                        supabaseClient={supabase}
                        providers={['github']}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: 'hsl(220 60% 50%)',
                                        brandAccent: 'hsl(220 65% 45%)',
                                        brandButtonText: 'white',
                                        inputBackground: 'hsl(210 11% 15%)',
                                        inputBorder: 'hsl(210 11% 25%)',
                                        inputText: 'white',
                                        inputLabelText: 'hsl(210 11% 70%)',
                                    },
                                    space: {
                                        spaceSmall: '4px',
                                        spaceMedium: '8px',
                                        spaceLarge: '16px'
                                    },
                                    radii: {
                                        borderRadiusButton: '8px',
                                        inputBorderRadius: '8px',
                                    }
                                }
                            },
                            className: {
                                button: '!transition-all !duration-200 hover:!scale-[1.02]',
                                divider: '!bg-gray-700',
                                message: '!bg-blue-900/30 !border !border-blue-800/50',
                            }
                        }}
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'Correo electrónico',
                                    password_label: 'Contraseña',
                                    email_input_placeholder: 'tu@email.com',
                                    password_input_placeholder: '••••••••',
                                    button_label: 'Iniciar sesión',
                                    loading_button_label: 'Iniciando sesión...',
                                    link_text: '¿Ya tienes cuenta? Inicia sesión',
                                },
                                sign_up: {
                                    email_label: 'Correo electrónico',
                                    password_label: 'Contraseña',
                                    email_input_placeholder: 'tu@email.com',
                                    password_input_placeholder: '••••••••',
                                    button_label: 'Crear cuenta',
                                    loading_button_label: 'Creando cuenta...',
                                    link_text: '¿No tienes cuenta? Regístrate gratis',
                                },
                                forgotten_password: {
                                    link_text: '¿Olvidaste tu contraseña?'
                                }
                            }
                        }}
                        theme="dark"
                    />
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-700/50 text-center">
                    <p className="text-sm text-gray-400">
                        Al continuar, aceptas nuestros {' '}
                        <a href="#" className="text-blue-400 hover:text-blue-300 underline">Términos</a> y {' '}
                        <a href="#" className="text-blue-400 hover:text-blue-300 underline">Política de Privacidad</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}