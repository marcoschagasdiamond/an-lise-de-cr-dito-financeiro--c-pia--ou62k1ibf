onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (record.get('origem') === 'solicitar_diagnostico') {
    console.log('[Notificação] Nova prospecção direta recebida. Empresa: ' + record.get('nome'))
  }
  e.next()
}, 'clientes')
