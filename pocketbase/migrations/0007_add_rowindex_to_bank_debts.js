migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('bank_debts_amortization')
    if (!collection.fields.getByName('rowIndex')) {
      collection.fields.add(new NumberField({ name: 'rowIndex' }))
    }
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('bank_debts_amortization')
    collection.fields.removeByName('rowIndex')
    app.save(collection)
  },
)
