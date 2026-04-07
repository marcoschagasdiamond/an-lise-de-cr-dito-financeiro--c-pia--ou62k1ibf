migrate(
  (app) => {
    const parceiros = app.findCollectionByNameOrId('parceiros')
    if (!parceiros.fields.getByName('percentual_comissao')) {
      parceiros.fields.add(new NumberField({ name: 'percentual_comissao' }))
    }
    app.save(parceiros)
  },
  (app) => {
    const parceiros = app.findCollectionByNameOrId('parceiros')
    parceiros.fields.removeByName('percentual_comissao')
    app.save(parceiros)
  },
)
