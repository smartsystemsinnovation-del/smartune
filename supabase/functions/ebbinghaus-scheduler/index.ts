import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Expected params from the React/Kotlin client
    const { id_usuario, id_cancion, calidad_respuesta } = await req.json()
    // calidad_respuesta: 0-5 (0: Blank, 5: Perfect response)

    if (id_usuario === undefined || id_cancion === undefined || calidad_respuesta === undefined) {
       throw new Error("Parámetros incompletos. Se requiere id_usuario, id_cancion y calidad_respuesta (0-5)");
    }

    // 1. Fetch current SRS stats
    const { data: historial, error: fetchError } = await supabaseClient
      .from('historial_usuario')
      .select('id, repeticiones, intervalo, factor_facilidad')
      .eq('usuario_id', id_usuario)
      .eq('cancion_id', id_cancion)
      .single()

    let repeticiones = 0;
    let intervalo = 0;
    let factor_facilidad = 2.5;
    let historialId = null;

    if (historial) {
      repeticiones = historial.repeticiones;
      intervalo = historial.intervalo;
      factor_facilidad = historial.factor_facilidad;
      historialId = historial.id;
    }

    // 2. SM-2 Algorithm Calculation
    if (calidad_respuesta >= 3) {
      if (repeticiones === 0) {
        intervalo = 1
      } else if (repeticiones === 1) {
        intervalo = 6
      } else {
        intervalo = Math.round(intervalo * factor_facilidad)
      }
      repeticiones += 1
    } else {
      repeticiones = 0
      intervalo = 1
    }

    factor_facilidad = factor_facilidad + (0.1 - (5 - calidad_respuesta) * (0.08 + (5 - calidad_respuesta) * 0.02))
    if (factor_facilidad < 1.3) factor_facilidad = 1.3

    const next_practice = new Date()
    next_practice.setDate(next_practice.getDate() + intervalo)

    // 3. Upsert database
    let updateError;
    if (historialId) {
      const result = await supabaseClient
        .from('historial_usuario')
        .update({
          repeticiones,
          intervalo,
          factor_facilidad,
          proxima_practica: next_practice.toISOString(),
          fecha_practica: new Date().toISOString()
        })
        .eq('id', historialId)
      updateError = result.error;
    } else {
      const result = await supabaseClient
        .from('historial_usuario')
        .insert({
          usuario_id: id_usuario,
          cancion_id: id_cancion,
          repeticiones,
          intervalo,
          factor_facilidad,
          proxima_practica: next_practice.toISOString(),
          fecha_practica: new Date().toISOString()
        })
      updateError = result.error;
    }

    if (updateError) throw updateError

    return new Response(JSON.stringify({ 
      success: true, 
      next_practice: next_practice.toISOString(),
      factor_facilidad,
      intervalo 
    }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message ?? "Error en el cálculo SRS" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }
})
