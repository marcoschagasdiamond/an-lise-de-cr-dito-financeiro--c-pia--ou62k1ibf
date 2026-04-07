migrate(
  (app) => {
    const collection = new Collection({
      name: 'tabela_credores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'valor_principal', type: 'number' },
        { name: 'prestacao_mensal', type: 'number' },
        { name: 'numero_parcelas', type: 'number' },
        { name: 'saldo_devedor_atual', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('tabela_credores')
    app.delete(collection)
  },
)
