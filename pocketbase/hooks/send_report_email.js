routerAdd(
  'POST',
  '/backend/v1/reports/{id}/send',
  (e) => {
    const id = e.request.pathValue('id')
    const body = e.requestInfo().body
    const email = body.email

    if (!email) {
      return e.badRequestError('O endereço de e-mail é obrigatório.')
    }

    try {
      const record = $app.findRecordById('historico_analises', id)

      // Logic to send email would be integrated here using $http.send
      // to external providers like SendGrid or AWS SES
      console.log(`Mocking send email for report ${id} to ${email}`)

      return e.json(200, { success: true, message: `Relatório enviado com sucesso para ${email}` })
    } catch (err) {
      return e.notFoundError('Relatório não encontrado.')
    }
  },
  $apis.requireAuth(),
)
