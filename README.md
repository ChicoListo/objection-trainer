# 🤖 AI Objection Trainer

**AI Objection Trainer** es una aplicación web diseñada para ayudar a profesionales de ventas a mejorar sus habilidades de manejo de objeciones. Utiliza Inteligencia Artificial para generar escenarios realistas y proporcionar feedback instantáneo, actuando como un coach de ventas personal disponible 24/7.

Este proyecto fue construido como mi primer gran proyecto técnico, con un enfoque en el stack moderno de JavaScript y herramientas low-code para un desarrollo rápido y escalable.

**[➡️ Visita la aplicación en vivo](https://objection-trainer.vercel.app/)**  

---

## ✨ Características Principales

*   **Generador de Objeciones por IA:** Recibe objeciones de ventas realistas y variadas (`"Es muy caro"`, `"Ya trabajo con la competencia"`, etc.).
*   **Práctica Interactiva:** Responde a las objeciones mediante texto o voz.
*   **Feedback Instantáneo:** La IA analiza tu respuesta, te da una puntuación del 1 al 10 y 3 puntos de feedback constructivo para mejorar.
*   **Historial de Sesiones:** Revisa tus sesiones pasadas para ver tu progreso y consolidar tu aprendizaje.
*   **Autenticación Segura:** Los usuarios pueden registrarse y tener un espacio personal y seguro para sus entrenamientos.

## 🛠️ Stack Tecnológico

Este proyecto se construyó con un stack 100% gratuito, enfocado en la escalabilidad y la experiencia del desarrollador:

*   **Framework:** [Next.js](https://nextjs.org/) (con App Router y TypeScript)
*   **Frontend:** [React](https://react.dev/) y [Tailwind CSS](https://tailwindcss.com/) para el diseño.
*   **Backend & Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL, Autenticación, Edge Functions).
*   **Inteligencia Artificial:** Modelos de Lenguaje de [Hugging Face](https://huggingface.co/) (ej. `Mistral-7B-Instruct`) a través de su Inference API.
*   **Hosting:** [Vercel](https://vercel.com/) para despliegues continuos y hosting serverless.
*   **Reconocimiento de Voz:** Web Speech API nativa del navegador.

## 🚀 Cómo Ponerlo en Marcha Localmente

Si quieres ejecutar este proyecto en tu propia máquina, sigue estos pasos:

### Prerrequisitos

*   [Node.js](https://nodejs.org/) (versión LTS recomendada)
*   [Git](https://git-scm.com/)
*   Una cuenta gratuita en [Supabase](https://supabase.com/)
*   Una cuenta gratuita en [Hugging Face](https://huggingface.co/)

### Pasos de Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/TU_USUARIO/objection-trainer.git
    cd objection-trainer
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    *   Crea un archivo llamado `.env.local` en la raíz del proyecto.
    *   Añade tus claves de Supabase. Las encontrarás en `Settings > API` en tu panel de Supabase.

    ```
    NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
    NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_PUBLIC_DE_SUPABASE
    ```

4.  **Configura los secrets de Supabase para la IA:**
    *   Instala la CLI de Supabase: `npm install supabase --save-dev`
    *   Inicia sesión: `npx supabase login`
    *   Vincula tu proyecto: `npx supabase link --project-ref TU_PROJECT_REF`
    *   Añade tu token de Hugging Face (lo encuentras en `Settings > Access Tokens` en Hugging Face) como un secret:
    ```bash
    npx supabase secrets set HF_ACCESS_TOKEN=TU_TOKEN_DE_HUGGING_FACE
    ```

5.  **Ejecuta el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

¡Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación funcionando!

---

## 💡 Lecciones Aprendidas y Futuro del Proyecto

Este proyecto ha sido un viaje de aprendizaje increíble en el desarrollo full-stack moderno. Algunos de los próximos pasos que me gustaría explorar son:

*   [ ] Añadir diferentes "personalidades" de clientes para la IA (ej. "CEO ocupado", "Analista técnico detallista").
*   [ ] Crear un dashboard con estadísticas de progreso del usuario.
*   [ ] Implementar un sistema de pago con Stripe para una versión "Pro".

¡Gracias por revisar mi proyecto!