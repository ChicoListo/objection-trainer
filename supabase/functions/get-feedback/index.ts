// supabase/functions/get-feedback/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const createPrompt = (objection: string, userResponse: string) => {
  return `
  **Contexto:** Un vendedor está practicando cómo manejar objeciones de clientes.
  
  **Tu Rol:** Eres un coach de ventas de élite, experto en técnicas de negociación y psicología del cliente. Eres directo, constructivo y tu objetivo es convertir a un buen vendedor en uno excelente.
  
  **La Objeción del Cliente fue:** "${objection}"
  
  **La Respuesta del Vendedor fue:** "${userResponse}"
  
  **Tu Tarea:**
  1.  Evalúa la respuesta del vendedor en una escala del 1 al 10, donde 1 es muy pobre y 10 es una respuesta perfecta.
  2.  Proporciona exactamente 3 puntos de feedback accionables. Cada punto debe ser corto, claro y constructivo. Enfócate en:
      -   **Empatía:** ¿Validó la preocupación del cliente?
      -   **Redirección al Valor:** ¿Pudo desviar la conversación del problema (ej. precio) hacia el valor o el ROI?
      -   **Siguiente Paso:** ¿Propuso un siguiente paso claro (ej. una demo, un caso de estudio, una pregunta de seguimiento)?
  
  **Formato de Salida Obligatorio:**
  Responde ÚNICAMENTE con un objeto JSON válido, sin ningún otro texto, introducción o explicación. La estructura del JSON debe ser:
  {
    "score": <un número del 1 al 10>,
    "feedback_points": [
      "<primer punto de feedback>",
      "<segundo punto de feedback>",
      "<tercer punto de feedback>"
    ]
  }
  `
}

const AI_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { objection, userResponse } = await req.json();
    if (!objection || !userResponse) {
      throw new Error("La objeción y la respuesta del usuario son requeridas.");
    }

    const hfAccessToken = Deno.env.get('HF_ACCESS_TOKEN')
    if (!hfAccessToken) {
      throw new Error('Hugging Face access token no encontrado.')
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${AI_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: createPrompt(objection, userResponse),
          parameters: {
            max_new_tokens: 250, // Más tokens para la respuesta JSON
            temperature: 0.5, // Más preciso para seguir el formato
            return_full_text: false,
          }
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error en la API de Hugging Face: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    const generatedText = result[0]?.generated_text.trim();

    if (!generatedText) {
      throw new Error('La IA no generó texto de feedback.')
    }

    // Intentamos parsear la respuesta de la IA como JSON. ¡Paso crítico!
    const feedbackJson = JSON.parse(generatedText);

    return new Response(
      JSON.stringify({ feedback: feedbackJson }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      }
    )
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : "Error al procesar el feedback.";
    // Si el error es de JSON.parse, podemos dar un mensaje más útil
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "La IA devolvió un formato inválido." }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
})