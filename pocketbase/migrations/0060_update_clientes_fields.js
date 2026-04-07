migrate(
  (app) => {
    const clientes = app.findCollectionByNameOrId('clientes')

    if (!clientes.fields.getByName('nome_responsavel'))
      clientes.fields.add(new TextField({ name: 'nome_responsavel' }))
    if (!clientes.fields.getByName('prazo_desejado'))
      clientes.fields.add(new TextField({ name: 'prazo_desejado' }))
    if (!clientes.fields.getByName('descricao'))
      clientes.fields.add(new TextField({ name: 'descricao' }))
    if (!clientes.fields.getByName('comissao_gerada'))
      clientes.fields.add(new BoolField({ name: 'comissao_gerada' }))
    if (!clientes.fields.getByName('observacoes'))
      clientes.fields.add(new TextField({ name: 'observacoes' }))

    const parceiroIdField = clientes.fields.getByName('parceiro_id')
    if (parceiroIdField) {
      parceiroIdField.required = false
    }

    app.save(clientes)
  },
  (app) => {
    const clientes = app.findCollectionByNameOrId('clientes')
    clientes.fields.removeByName('nome_responsavel')
    clientes.fields.removeByName('prazo_desejado')
    clientes.fields.removeByName('descricao')
    clientes.fields.removeByName('comissao_gerada')
    clientes.fields.removeByName('observacoes')

    const parceiroIdField = clientes.fields.getByName('parceiro_id')
    if (parceiroIdField) {
      parceiroIdField.required = true
    }

    app.save(clientes)
  },
)
