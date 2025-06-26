import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// --- CONSTANTES ---
// Cabeceras CORS para permitir la comunicación desde el navegador.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Modelo de IA a utilizar. Volvemos a nuestro modelo original.
const AI_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'; // <-- LÍNEA CAMBIADA

// --- PROMPT ENGINEERING ---
// La función que construye las instrucciones para la IA.
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

// --- SERVIDOR DE LA FUNCIÓN ---
serve(async (req: Request): Promise<Response> => {
  // Manejo de la petición pre-vuelo OPTIONS para CORS.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    // 1. Obtener y validar los datos de entrada.
    const { objection, userResponse } = await req.json();
    if (!objection || !userResponse) {
      throw new Error("La objeción y la respuesta del usuario son requeridas.");
    }

    // 2. Obtener el token de acceso de forma segura.
    const hfAccessToken = Deno.env.get('HF_ACCESS_TOKEN');
    if (!hfAccessToken) {
      throw new Error('Hugging Face access token no encontrado.');
    }

    // 3. Llamar a la API de Hugging Face.
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
          parameters: { max_new_tokens: 250, temperature: 0.5, return_full_text: false }
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error en la API de Hugging Face: ${response.status} ${errorBody}`);
    }

    // 4. Procesar la respuesta de la IA.
    const result = await response.json();
    const generatedText = result[0]?.generated_text.trim();
    if (!generatedText) {
      throw new Error('La IA no generó texto de feedback.');
    }

    // 5. Extraer y limpiar el JSON de la respuesta.
    const jsonMatch = generatedText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      console.error("Texto recibido de la IA que no contiene JSON:", generatedText);
      throw new Error("La IA no devolvió un formato JSON reconocible.");
    }

    // Limpiamos el string de JSON para eliminar comas "colgantes" (trailing commas).
    const cleanedJsonString = jsonMatch[0].replace(/,\s*([}\]])/g, "$1");

    // 6. Parsear el JSON limpio.
    const feedbackJson = JSON.parse(cleanedJsonString);

    // 7. Devolver la respuesta exitosa al cliente.
    return new Response(
      JSON.stringify({ feedback: feedbackJson }),
      {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // Manejo de errores centralizado.
    console.error("Error en la función get-feedback:", error);
    const errorMessage = error instanceof Error ? error.message : "Un error inesperado ha ocurrido.";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    );
  }
});