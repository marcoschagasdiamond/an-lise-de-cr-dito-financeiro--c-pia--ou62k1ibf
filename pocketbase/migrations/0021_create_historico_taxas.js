migrate(
  (app) => {
    const collection = new Collection({
      name: 'historico_taxas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'data_atualizacao', type: 'date', required: true },
        { name: 'selic_12m', type: 'number', required: true },
        { name: 'ipca_12m', type: 'number', required: true },
        { name: 'cdi_12m', type: 'number', required: true },
        { name: 'tr_12m', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_historico_taxas_data ON historico_taxas (data_atualizacao)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('historico_taxas')
    app.delete(collection)
  },
)
