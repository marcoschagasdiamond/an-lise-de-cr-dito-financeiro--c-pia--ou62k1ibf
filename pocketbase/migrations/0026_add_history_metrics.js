migrate(
  (app) => {
    const historyCol = app.findCollectionByNameOrId('historico_analises')
    historyCol.fields.add(new NumberField({ name: 'faturamento' }))
    historyCol.fields.add(new NumberField({ name: 'ebitda' }))
    historyCol.fields.add(new NumberField({ name: 'ebit' }))
    app.save(historyCol)

    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.fields.add(new NumberField({ name: 'ebitda_target' }))
    app.save(usersCol)
  },
  (app) => {
    const historyCol = app.findCollectionByNameOrId('historico_analises')
    historyCol.fields.removeByName('faturamento')
    historyCol.fields.removeByName('ebitda')
    historyCol.fields.removeByName('ebit')
    app.save(historyCol)

    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.fields.removeByName('ebitda_target')
    app.save(usersCol)
  },
)
