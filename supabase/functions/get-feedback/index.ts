// supabase/functions/get-feedback/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// --- CONSTANTE PARA LAS CABECERAS ---
// Esto elimina la repetición y el riesgo de errores tipográficos.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // VERIFICADO: Sin espacios
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2';

const createPrompt = (objection: string, userResponse: string) => {
  // ... (Tu prompt va aquí)
  return `**Contexto:** Un vendedor...`;
}

serve(async (req: Request): Promise<Response> => {
  // Manejo de la petición pre-vuelo OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { objection, userResponse } = await req.json();
    if (!objection || !userResponse) {
      throw new Error("La objeción y la respuesta del usuario son requeridas.");
    }

    const hfAccessToken = Deno.env.get('HF_ACCESS_TOKEN');
    if (!hfAccessToken) {
      throw new Error('Hugging Face access token no encontrado.');
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
          parameters: { max_new_tokens: 250, temperature: 0.5, return_full_text: false }
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error en la API de Hugging Face: ${response.status} ${errorBody}`);
    }

    const result = await response.json();
    const generatedText = result[0]?.generated_text.trim();
    if (!generatedText) throw new Error('La IA no generó texto de feedback.');

    const jsonMatch = generatedText.match(/{[\s\S]*}/);
    if (!jsonMatch) throw new Error("La IA no devolvió un formato JSON reconocible.");

    const feedbackJson = JSON.parse(jsonMatch[0]);

    // Respuesta exitosa
    return new Response(
      JSON.stringify({ feedback: feedbackJson }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Error al procesar el feedback.";

    // Respuesta de error
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      }
    );
  }
});