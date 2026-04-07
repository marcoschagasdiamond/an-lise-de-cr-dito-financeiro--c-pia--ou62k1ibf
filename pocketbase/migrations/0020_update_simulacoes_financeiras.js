migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('simulacoes_financeiras')

    if (!col.fields.getByName('effective_rate')) {
      col.fields.add(new NumberField({ name: 'effective_rate' }))
    }
    if (!col.fields.getByName('indexer_last_update')) {
      col.fields.add(new DateField({ name: 'indexer_last_update' }))
    }
    app.save(col)

    const cacheCol = new Collection({
      name: 'indexer_cache',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'rates', type: 'json', required: true },
        { name: 'last_fetch', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cacheCol)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('simulacoes_financeiras')
    col.fields.removeByName('effective_rate')
    col.fields.removeByName('indexer_last_update')
    app.save(col)

    try {
      const cacheCol = app.findCollectionByNameOrId('indexer_cache')
      app.delete(cacheCol)
    } catch (_) {}
  },
)
