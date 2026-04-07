onRecordUpdate((e) => {
  const newStatus = e.record.get('status')
  try {
    const oldRecord = $app.findRecordById('pendencias', e.record.id)
    if (oldRecord.get('status') !== 'resolvida' && newStatus === 'resolvida') {
      e.set('notify_resolved', true)
    }
  } catch (_) {}
  e.next()
}, 'pendencias')

onRecordAfterUpdateSuccess((e) => {
  if (e.get('notify_resolved')) {
    try {
      const projeto = $app.findRecordById('projetos', e.record.get('projeto_id'))
      const cliente = $app.findRecordById('clientes', projeto.get('cliente_id'))
      const userId = cliente.get('user_id')
      if (userId) {
        const notificacoes = $app.findCollectionByNameOrId('notificacoes')
        const notif = new Record(notificacoes)
        notif.set('user_id', userId)
        notif.set('projeto_id', projeto.id)
        notif.set('tipo', 'success')
        notif.set('mensagem', 'Pendência resolvida: ' + e.record.get('descricao'))
        notif.set('lida', false)
        $app.save(notif)
      }
    } catch (err) {
      console.log('Erro notificar pendencia:', err)
    }
  }
  e.next()
}, 'pendencias')
