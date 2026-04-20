import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import jwt from 'npm:jsonwebtoken@9.0.2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Tratamento do preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Faltando variáveis de ambiente do Supabase')
      return new Response(JSON.stringify({ error: 'Erro interno de configuração do servidor' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Valida o usuário diretamente no banco via RPC
    const { data, error } = await supabase.rpc('validar_login', {
      p_email: email,
      p_senha: password,
    })

    if (error || !data || !data.success) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const jwtSecret =
      Deno.env.get('SUPABASE_JWT_SECRET') ??
      'super-secret-jwt-token-with-at-least-32-characters-long'

    // Assina o token JWT customizado com claims compatíveis com o Supabase
    const token = jwt.sign(
      {
        aud: 'authenticated',
        sub: data.usuario_id,
        email: email,
        role: 'authenticated', // Mantém 'authenticated' para o RLS funcionar
        user_metadata: {
          nome: data.usuario?.nome,
          tipo_usuario: data.tipo_usuario,
          status: data.usuario?.status,
        },
      },
      jwtSecret,
      { expiresIn: '1d' },
    )

    return new Response(
      JSON.stringify({
        success: true,
        token,
        usuario_id: data.usuario_id,
        tipo_usuario: data.tipo_usuario,
        user: data.usuario,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Erro na edge function de login:', error)
    return new Response(JSON.stringify({ error: 'Credenciais inválidas ou erro interno' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
