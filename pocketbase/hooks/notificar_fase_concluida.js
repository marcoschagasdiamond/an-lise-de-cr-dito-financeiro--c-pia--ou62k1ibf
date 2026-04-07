onRecordAfterUpdateSuccess((e) => {
  const fase = e.record
  const oldStatus = e.original.get('status')
  const newStatus = fase.get('status')

  if (oldStatus !== 'concluida' && newStatus === 'concluida') {
    const projetoId = fase.get('projeto_id')
    try {
      const projeto = $app.findRecordById('projetos', projetoId)
      const clienteId = projeto.get('cliente_id')
      const cliente = $app.findRecordById('clientes', clienteId)
      const parceiroId = cliente.get('parceiro_id')

      const notificacoesCol = $app.findCollectionByNameOrId('notificacoes')
      const notif = new Record(notificacoesCol)
      notif.set('user_id', parceiroId)
      notif.set('projeto_id', projetoId)
      notif.set(
        'mensagem',
        `A fase ${fase.get('numero_fase')} (${fase.get('nome_fase')}) do projeto de ${cliente.get('nome')} foi concluída.`,
      )
      notif.set('tipo', 'success')
      notif.set('lida', false)
      $app.save(notif)

      const nextFaseNum = fase.get('numero_fase') + 1
      try {
        const nextFase = $app.findFirstRecordByFilter(
          'fases_projeto',
          'projeto_id = {:projetoId} && numero_fase = {:num}',
          { projetoId: projetoId, num: nextFaseNum },
        )
        nextFase.set('status', 'em_progresso')
        nextFase.set('data_inicio', new Date().toISOString())
        $app.save(nextFase)
      } catch (_) {}

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
            subject: `Atualização de Projeto - Fase ${fase.get('numero_fase')} Concluída`,
            html: `<p>Olá,</p><p>A fase <strong>${fase.get('nome_fase')}</strong> do seu projeto foi concluída com sucesso!</p>`,
          }),
        })
      }
    } catch (err) {
      console.log('Erro no hook notificar_fase_concluida:', err)
    }
  }

  e.next()
}, 'fases_projeto')
