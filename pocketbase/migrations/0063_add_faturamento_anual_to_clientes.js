migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')
    if (!col.fields.getByName('faturamento_anual')) {
      col.fields.add(new NumberField({ name: 'faturamento_anual' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')
    col.fields.removeByName('faturamento_anual')
    app.save(col)
  },
)
