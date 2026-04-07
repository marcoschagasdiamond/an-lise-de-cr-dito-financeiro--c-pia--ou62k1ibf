import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as bcrypt from 'npm:bcryptjs'
import jwt from 'npm:jsonwebtoken'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    if (email !== 'marcoschagasdiamond@icloud.com' || password !== 'Mac318180') {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: existingUser, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'marcoschagasdiamond@icloud.com')
      .maybeSingle()

    let userId = existingUser?.id

    if (!existingUser) {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync('Mac318180', salt)

      const { data: newUser, error: createError } = await supabase
        .from('usuarios')
        .insert({
          email: 'marcoschagasdiamond@icloud.com',
          senha_hash: hash,
          nome: 'Marcos Chagas',
          tipo_usuario: 'admin',
          status: 'ativo',
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Erro ao criar usuário: ${createError.message}`)
      }
      userId = newUser.id

      const { error: adminError } = await supabase.from('administradores').insert({
        usuario_id: userId,
        nome: 'Marcos Chagas',
        permissoes: { todas: true },
      })

      if (adminError) {
        throw new Error(`Erro ao criar administrador: ${adminError.message}`)
      }
    } else {
      if (!existingUser.senha_hash) {
        return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      let isValid = false
      // Valida caso a senha esteja como texto plano acidentalmente no banco
      if (existingUser.senha_hash === password) {
        isValid = true
      } else {
        try {
          isValid = bcrypt.compareSync(password, existingUser.senha_hash)
        } catch (e) {
          isValid = false
        }
      }

      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    const jwtSecret =
      Deno.env.get('SUPABASE_JWT_SECRET') ??
      'super-secret-jwt-token-with-at-least-32-characters-long'
    const token = jwt.sign(
      { sub: userId, email: 'marcoschagasdiamond@icloud.com', role: 'admin' },
      jwtSecret,
      { expiresIn: '1d' },
    )

    return new Response(JSON.stringify({ success: true, token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
