// tailwind.config.ts

import type { Config } from 'tailwindcss'

const config: Config = {
    // Aquí es donde le decimos a Tailwind qué archivos debe "vigilar"
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        // ¡LA LÍNEA MÁGICA! Para que los estilos de Supabase Auth UI funcionen
        './node_modules/@supabase/auth-ui-react/dist/components/**/*.{js,ts,jsx,tsx}',
    ],
    // 'theme' es donde personalizarías tu diseño (colores, fuentes, etc.) en el futuro
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    // 'plugins' es donde puedes añadir funcionalidades extra a Tailwind
    plugins: [],
}
export default config