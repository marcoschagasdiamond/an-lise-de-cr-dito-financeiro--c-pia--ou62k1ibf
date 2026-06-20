import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import * as bcrypt from 'npm:bcryptjs@2.4.3'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const body = await req.json()
    const { action, id, email, password, nome, razao_social, cnpj, cpf, telefone, tipo_usuario, permissoes } = body

    if (action === 'create') {
      const tipo = tipo_usuario || 'parceiro'
      const nomeFinal = razao_social || nome || (tipo === 'admin' ? 'Administrador' : 'Parceiro')

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: password || 'SenhaPadrao123!',
        email_confirm: true,
        user_metadata: {
          nome: nomeFinal,
          tipo_usuario: tipo,
          status: tipo === 'admin' ? 'ativo' : 'pendente'
        }
      })

      if (error) throw error

      const userId = data.user.id

      const { error: updateError, data: updateData } = await supabase
        .from('usuarios')
        .update({
          razao_social,
          cnpj,
          cpf,
          telefone,
          status: tipo === 'admin' ? 'ativo' : 'pendente',
          tipo_usuario: tipo
        })
        .eq('id', userId)
        .select()

      if (updateError || !updateData || updateData.length === 0) {
        await supabase.from('usuarios').upsert({
          id: userId,
          email,
          nome: nomeFinal,
          razao_social,
          cnpj,
          cpf,
          telefone,
          status: tipo === 'admin' ? 'ativo' : 'pendente',
          tipo_usuario: tipo
        })
      }

      if (tipo === 'admin') {
        await supabase.from('administradores').insert({
          usuario_id: userId,
          nome: nomeFinal,
          email: email,
          permissoes: permissoes || ['*'],
          status: 'ativo'
        })
      } else {
        await supabase.from('parceiros').insert({
          usuario_id: userId,
          nome_parceiro: nomeFinal,
          cnpj,
          status: 'pendente',
          comissao_percentual: 0
        })
      }

      return new Response(JSON.stringify({ success: true, user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update') {
      if (email) {
        const { error } = await supabase.auth.admin.updateUserById(id, { email })
        if (error) throw error
      }
      
      const { error } = await supabase
        .from('usuarios')
        .update({
          email,
          razao_social,
          cnpj,
          cpf,
          telefone,
          nome: razao_social || nome
        })
        .eq('id', id)
        
      if (error) throw error
      
      await supabase.from('parceiros')
        .update({
          nome_parceiro: razao_social || nome,
          cnpj
        })
        .eq('usuario_id', id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'update_password') {
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(password, salt)

      const { error: authError } = await supabase.auth.admin.updateUserById(id, { password })
      if (authError) throw authError

      const { error: dbError } = await supabase
        .from('usuarios')
        .update({ senha_hash: hash })
        .eq('id', id)
        
      if (dbError) throw dbError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'delete') {
      const { error } = await supabase.auth.admin.deleteUser(id)
      if (error) throw error
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
