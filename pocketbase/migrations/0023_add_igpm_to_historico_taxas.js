migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('historico_taxas')
    if (!col.fields.getByName('igpm_12m')) {
      col.fields.add(new NumberField({ name: 'igpm_12m', required: false }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('historico_taxas')
    if (col.fields.getByName('igpm_12m')) {
      col.fields.removeByName('igpm_12m')
    }
    app.save(col)
  },
)
