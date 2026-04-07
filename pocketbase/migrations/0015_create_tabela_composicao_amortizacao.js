migrate(
  (app) => {
    const credoresCollection = app.findCollectionByNameOrId('tabela_credores')

    const collection = new Collection({
      name: 'tabela_composicao_amortizacao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'credor_id',
          type: 'relation',
          required: true,
          collectionId: credoresCollection.id,
          maxSelect: 1,
        },
        { name: 'periodo', type: 'text' },
        { name: 'valor', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_tab_comp_amor_credor ON tabela_composicao_amortizacao (credor_id)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('tabela_composicao_amortizacao')
    app.delete(collection)
  },
)
