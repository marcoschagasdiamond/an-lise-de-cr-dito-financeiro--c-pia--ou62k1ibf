onRecordAfterUpdateSuccess((e) => {
  const task = e.record
  const oldStatus = e.original.get('status')
  const newStatus = task.get('status')

  if (oldStatus !== 'rejeitado' && newStatus === 'rejeitado') {
    try {
      const fase = $app.findRecordById('fases_projeto', task.get('fase_id'))
      const projeto = $app.findRecordById('projetos', fase.get('projeto_id'))
      const cliente = $app.findRecordById('clientes', projeto.get('cliente_id'))

      const resendApiKey = $secrets.get('RESEND_API_KEY')
      if (resendApiKey && cliente.get('email')) {
        $http.send({
          url: 'https://api.resend.com/emails',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + resendApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Diamond Group <no-reply@diamondgroup.com.br>',
            to: [cliente.get('email')],
            subject: `Documento Rejeitado - ${task.get('descricao')}`,
            html: `<p>Olá ${cliente.get('nome')},</p><p>O documento <strong>${task.get('descricao')}</strong> foi analisado e rejeitado.</p><p><strong>Motivo:</strong> ${task.get('observacoes') || 'Por favor, verifique e reenvie o documento correto.'}</p><p>Acesse o portal "Meu Projeto" para realizar o novo envio.</p>`,
          }),
        })
      }
    } catch (err) {
      console.log('Erro no hook on_tarefa_rejected', err)
    }
  }
  e.next()
}, 'tarefas_fase')
