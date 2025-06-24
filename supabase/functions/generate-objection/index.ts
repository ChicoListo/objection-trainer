// supabase/functions/generate-objection/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// El prompt que le daremos a la IA. ¡Aquí está la magia!
// Lo hacemos una función para poder personalizarlo en el futuro.
const createPrompt = () => {
  return `Actúa como un director de marketing escéptico de una empresa mediana. 
  Genera una única objeción de ventas corta y realista para un nuevo software SaaS de análisis de redes sociales.
  La objeción debe ser directa y sonar auténtica.
  Categorías posibles: precio, competencia, falta de necesidad percibida, complejidad de implementación.
  Ejemplo: "Ya usamos otra herramienta y migrar todos nuestros datos sería una pesadilla."
  Dame solo la frase de la objeción, sin introducciones ni explicaciones.`
}

// El nombre del modelo que usaremos en Hugging Face
const AI_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

serve(async (req) => {
  // Este bloque de código es para manejar CORS. Es un requisito de seguridad
  // para que los navegadores permitan a tu web llamar a esta función.
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // 1. Obtenemos el token de Hugging Face que guardamos de forma segura.
    const hfAccessToken = Deno.env.get('HF_ACCESS_TOKEN')
    if (!hfAccessToken) {
      throw new Error('Hugging Face access token no encontrado.')
    }

    // 2. Llamamos a la API de Inferencia de Hugging Face.
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${AI_MODEL}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: createPrompt(),
          parameters: {
            max_new_tokens: 50, // Limita la longitud de la respuesta
            temperature: 0.8, // Aumenta la creatividad/variabilidad
            return_full_text: false, // Solo devuelve el texto generado, no el prompt
          }
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Error en la API de Hugging Face: ${response.status} ${errorBody}`);
    }

    // 3. Procesamos la respuesta de la IA.
    const result = await response.json()
    // La respuesta de Hugging Face es un array, usualmente con un solo elemento.
    const generatedText = result[0]?.generated_text.trim()

    if (!generatedText) {
      throw new Error('La IA no generó texto.')
    }

    // 4. Devolvemos la objeción en un formato JSON limpio.
    return new Response(
      JSON.stringify({ objection: generatedText }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Permite el acceso desde cualquier origen
        },
      }
    )
  } catch (error) {
    // Manejo de errores
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    })
  }
})
