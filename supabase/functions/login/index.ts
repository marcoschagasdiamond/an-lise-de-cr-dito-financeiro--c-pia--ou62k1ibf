import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
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

    // Cria o client com Service Role para acessar a API Admin do Auth e desabilitar sessões na Edge Function
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Valida o usuário diretamente no banco de dados via RPC (tabela public.usuarios)
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

    let userId = data.usuario_id

    // Tenta buscar o usuário no auth.users para verificar se ele está sincronizado com o GoTrue
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId)

    if (authUserError || !authUser.user) {
      // Usuário não existe no auth.users por este ID (foi importado apenas na tabela pública), vamos criá-lo
      const { error: createError } = await supabase.auth.admin.createUser({
        id: userId,
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          nome: data.usuario?.nome,
          tipo_usuario: data.tipo_usuario,
          status: data.usuario?.status,
        },
      })

      if (createError) {
        console.error('Erro ao criar usuário no auth.users:', createError)

        // Se falhou porque o email já existe com outro ID, tentamos buscar esse ID real via RPC
        const { data: realId } = await supabase.rpc('get_auth_user_id_by_email', { p_email: email })

        if (realId) {
          userId = realId
          const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
            password: password,
            email_confirm: true,
            user_metadata: {
              nome: data.usuario?.nome,
              tipo_usuario: data.tipo_usuario,
              status: data.usuario?.status,
            },
          })

          if (updateError) {
            return new Response(
              JSON.stringify({ error: 'Falha ao sincronizar conta: ' + updateError.message }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              },
            )
          }
        } else {
          // Falhou por outro motivo (ex: senha muito curta < 6 caracteres)
          return new Response(
            JSON.stringify({ error: 'Erro ao processar conta: ' + createError.message }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }
      }
    } else {
      // Se ele já existe no auth.users mas o login normal falhou, pode ser dessincronização de senha
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: password,
        email_confirm: true,
      })
      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar credenciais: ' + updateError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
    }

    // Retorna sucesso para que o Frontend possa refazer a requisição de signIn com o GoTrue nativo
    return new Response(
      JSON.stringify({
        success: true,
        usuario_id: userId,
        tipo_usuario: data.tipo_usuario,
        user: data.usuario,
        synced: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    console.error('Erro na edge function de login:', error)
    return new Response(JSON.stringify({ error: 'Erro interno ou falha de comunicação' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
