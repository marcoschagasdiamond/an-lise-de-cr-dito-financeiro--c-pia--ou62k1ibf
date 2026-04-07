onRecordAfterUpdateSuccess((e) => {
  const record = e.record
  const original = e.original

  if (record.get('status') !== original.get('status')) {
    const col = $app.findCollectionByNameOrId('historico_comissoes')
    const hist = new Record(col)
    hist.set('comissao_id', record.id)
    hist.set('status_anterior', original.get('status'))
    hist.set('status_novo', record.get('status'))
    if (e.requestInfo && e.requestInfo().auth) {
      hist.set('usuario_alteracao', e.requestInfo().auth.id)
    }
    $app.save(hist)

    if (record.get('status') === 'aprovado') {
      console.log('Notificando parceiro sobre comissão aprovada: ' + record.get('parceiro_id'))
    } else if (record.get('status') === 'pago') {
      console.log(
        'Notificando parceiro sobre comissão paga (Email + SMS): ' + record.get('parceiro_id'),
      )
    }
  }
  e.next()
}, 'comissoes')
