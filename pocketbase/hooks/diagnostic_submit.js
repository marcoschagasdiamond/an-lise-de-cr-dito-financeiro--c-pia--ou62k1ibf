routerAdd('POST', '/backend/v1/consult-plan/diagnostic', (e) => {
  const body = e.requestInfo().body

  if (!body || !body.nomeEmpresa || !body.email) {
    return e.badRequestError("Os campos 'Nome da Empresa' e 'Email' são obrigatórios.")
  }

  // Log the submission to simulate sending an email to contato@dgroup.com.br
  console.log('=== NOVA SOLICITAÇÃO DE DIAGNÓSTICO ===')
  console.log(`Para: contato@dgroup.com.br`)
  console.log(`Empresa: ${body.nomeEmpresa}`)
  console.log(`CNPJ: ${body.cnpj || 'Não informado'}`)
  console.log(`Responsável: ${body.nomeResponsavel || 'Não informado'}`)
  console.log(`Email: ${body.email}`)
  console.log(`Telefone: ${body.telefone || 'Não informado'}`)
  console.log(`Valor de Captação: ${body.valorCaptacao || 'Não informado'}`)
  console.log(`Prazo: ${body.prazoDesejado || 'Não informado'}`)
  console.log(`Descrição: ${body.descricao || 'Não informado'}`)
  console.log('=======================================')

  return e.json(200, {
    success: true,
    message: 'Obrigado! Entraremos em contato em breve',
  })
})
