onRecordAfterUpdateSuccess((e) => {
  const fase = e.record
  const oldStatus = e.original.get('status')
  const newStatus = fase.get('status')

  if (
    fase.get('numero_fase') === 6 &&
    oldStatus !== 'em_progresso' &&
    newStatus === 'em_progresso'
  ) {
    try {
      const projeto = $app.findRecordById('projetos', fase.get('projeto_id'))
      const cliente = $app.findRecordById('clientes', projeto.get('cliente_id'))
      const parceiroId = cliente.get('parceiro_id')
      const parceiro = $app.findRecordById('users', parceiroId)

      const resendApiKey = $secrets.get('RESEND_API_KEY')
      if (resendApiKey && parceiro.get('email')) {
        $http.send({
          url: 'https://api.resend.com/emails',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + resendApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Diamond Group <no-reply@diamondgroup.com.br>',
            to: [parceiro.get('email')],
            subject: `Ação Necessária: Análise Financeira (Fase 6) - ${cliente.get('nome')}`,
            html: `<p>Olá,</p><p>O projeto do cliente <strong>${cliente.get('nome')}</strong> entrou na <strong>Fase 6 - Análises Financeiras</strong>.</p><p>Por favor, acesse o sistema para iniciar a análise e gerar o relatório.</p>`,
          }),
        })
      }
    } catch (err) {
      console.log('Erro no hook on_fase6_started', err)
    }
  }
  e.next()
}, 'fases_projeto')
