import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, nome, tipo, status, motivo } = await req.json()

    // SIMULAÇÃO DE ENVIO DE E-MAIL
    // Em um ambiente de produção real, integre com a API do Resend, SendGrid, etc.
    console.log('=== INÍCIO DO ENVIO DE E-MAIL ===')
    console.log(`To: ${email}`)
    
    if (status === 'aprovado') {
      console.log(`Subject: Cadastro Aprovado`)
      console.log(`Body: Olá ${nome}, seu cadastro como ${tipo} foi aprovado! Email: ${email}, Senha: a senha que você definiu no cadastro. Faça login em ${req.headers.get('origin') || 'nossa aplicação'}.`)
    } else if (status === 'rejeitado') {
      console.log(`Subject: Cadastro Rejeitado`)
      console.log(`Body: Olá ${nome}, seu cadastro foi rejeitado. Motivo: ${motivo}. Entre em contato com o administrador.`)
    }
    
    console.log('=== FIM DO ENVIO DE E-MAIL ===')

    return new Response(JSON.stringify({ success: true, message: 'E-mail processado com sucesso' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
