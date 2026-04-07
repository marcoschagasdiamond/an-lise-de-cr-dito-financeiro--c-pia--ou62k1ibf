routerAdd(
  'POST',
  '/backend/v1/admin/prospeccoes/{id}/atribuir',
  (e) => {
    const id = e.request.pathValue('id')
    const body = e.requestInfo().body
    const parceiroUserId = body.parceiro_id

    if (!parceiroUserId) {
      throw new BadRequestError('Parceiro não informado.')
    }

    let result = {}
    $app.runInTransaction((txApp) => {
      const cliente = txApp.findRecordById('clientes', id)

      if (cliente.get('parceiro_id')) {
        throw new BadRequestError('Cliente já possui parceiro atribuído.')
      }

      cliente.set('parceiro_id', parceiroUserId)
      txApp.save(cliente)

      let parceiroRecord = null
      try {
        parceiroRecord = txApp.findFirstRecordByData('parceiros', 'usuario_id', parceiroUserId)
      } catch (_) {
        throw new BadRequestError('Perfil de Parceiro não encontrado.')
      }

      const percentual = parceiroRecord.get('percentual_comissao') || 5
      const valorCaptacao = cliente.get('valor_captacao') || 0
      const valorComissao = (valorCaptacao * percentual) / 100

      const comissoesCol = txApp.findCollectionByNameOrId('comissoes')
      const comissao = new Record(comissoesCol)
      comissao.set('cliente_id', id)
      comissao.set('parceiro_id', parceiroUserId)
      comissao.set('percentual', percentual)
      comissao.set('valor_comissao', valorComissao)
      comissao.set('status', 'pendente')
      comissao.set('data_geracao', new Date().toISOString())
      txApp.save(comissao)

      cliente.set('comissao_gerada', true)
      txApp.save(cliente)

      result = { success: true, comissao_id: comissao.id }
    })

    return e.json(200, result)
  },
  $apis.requireSuperuserAuth(),
)
