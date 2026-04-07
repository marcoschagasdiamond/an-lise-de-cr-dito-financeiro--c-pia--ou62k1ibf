migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('bank_debts_amortization')
    if (!col.fields.getByName('guarantee')) {
      col.fields.add(new TextField({ name: 'guarantee' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('bank_debts_amortization')
    col.fields.removeByName('guarantee')
    app.save(col)
  },
)
