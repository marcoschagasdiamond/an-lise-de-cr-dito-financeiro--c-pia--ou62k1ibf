migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('simulacoes_financeiras')

    if (!col.fields.getByName('financing_type')) {
      col.fields.add(new SelectField({ name: 'financing_type', values: ['price', 'sac'] }))
    }
    if (!col.fields.getByName('indexer')) {
      col.fields.add(
        new SelectField({
          name: 'indexer',
          values: ['none', 'selic', 'ipca', 'tr', 'cdi', 'custom'],
        }),
      )
    }
    if (!col.fields.getByName('spread')) {
      col.fields.add(new NumberField({ name: 'spread' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('simulacoes_financeiras')
    col.fields.removeByName('financing_type')
    col.fields.removeByName('indexer')
    col.fields.removeByName('spread')
    app.save(col)
  },
)
