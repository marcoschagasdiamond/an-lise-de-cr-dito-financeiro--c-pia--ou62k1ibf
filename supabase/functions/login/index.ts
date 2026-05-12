import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

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

    // Cria o client com Service Role para acessar a API Admin do Auth
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    let userId: string = '';
    let userData: any = {};
    let isMarcos = false;

    // Intervenção direta para o acesso do admin solicitado (bypass para garantir login)
    if (email === 'marcoschagasdiamond@icloud.com' && password === 'Mac318180') {
      isMarcos = true;
      // Tenta recuperar o ID na tabela pública primeiro
      const { data: pubUser } = await supabase.from('usuarios').select('*').eq('email', email).maybeSingle();
      
      if (pubUser) {
        userId = pubUser.id;
        userData = {
          nome: pubUser.nome || 'Marcos Chagas',
          tipo_usuario: pubUser.tipo_usuario || 'admin',
          status: pubUser.status || 'ativo'
        };
      } else {
        // Se não encontrar, tenta pelo GoTrue Auth
        const { data: authIdData } = await supabase.rpc('get_auth_user_id_by_email', { p_email: email });
        
        if (authIdData) {
          userId = authIdData;
        } else {
          userId = crypto.randomUUID();
        }
        
        userData = {
          nome: 'Marcos Chagas',
          tipo_usuario: 'admin',
          status: 'ativo'
        };
        
        // Garante a existência do usuário na tabela pública
        await supabase.from('usuarios').insert({
          id: userId,
          email: email,
          nome: userData.nome,
          tipo_usuario: userData.tipo_usuario,
          status: userData.status
        });
      }
    } else {
      // Fluxo normal de validação para outros usuários
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

      userId = data.usuario_id;
      userData = {
        nome: data.usuario?.nome,
        tipo_usuario: data.tipo_usuario,
        status: data.usuario?.status
      };
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Falha ao processar ID do usuário' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Sincroniza o usuário forçadamente no GoTrue (auth.users)
    const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId)
    
    if (authUserError || !authUser.user) {
      // Se não encontrou pelo ID exato, tenta localizar pelo e-mail caso os IDs estejam divergentes
      const { data: realId } = await supabase.rpc('get_auth_user_id_by_email', { p_email: email })
      
      if (realId) {
        userId = realId
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { 
          password: password, 
          email_confirm: true,
          user_metadata: {
            nome: userData.nome,
            tipo_usuario: userData.tipo_usuario,
            status: userData.status
          }
        })
        
        if (updateError) {
          return new Response(JSON.stringify({ error: 'Falha ao sincronizar conta: ' + updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      } else {
        // Usuário definitivamente não existe no GoTrue, vamos criá-lo
        const { error: createError } = await supabase.auth.admin.createUser({
          id: userId,
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            nome: userData.nome,
            tipo_usuario: userData.tipo_usuario,
            status: userData.status
          }
        })
        
        if (createError) {
          return new Response(JSON.stringify({ error: 'Erro ao processar conta: ' + createError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }
    } else {
      // Usuário existe, atualiza a senha para garantir a sincronia e que o frontend consiga fazer o signIn nativo
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { 
        password: password, 
        email_confirm: true,
        user_metadata: {
          nome: userData.nome,
          tipo_usuario: userData.tipo_usuario,
          status: userData.status
        }
      })
      
      if (updateError) {
        return new Response(JSON.stringify({ error: 'Erro ao atualizar credenciais: ' + updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Retorna sucesso permitindo o frontend realizar o retry com o GoTrue atualizado
    return new Response(
      JSON.stringify({
        success: true,
        usuario_id: userId,
        tipo_usuario: userData.tipo_usuario,
        user: userData,
        synced: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Erro na edge function de login:', error)
    return new Response(JSON.stringify({ error: 'Erro interno ou falha de comunicação: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
