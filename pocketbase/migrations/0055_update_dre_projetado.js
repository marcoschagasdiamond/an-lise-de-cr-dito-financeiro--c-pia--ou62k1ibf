migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('dre_projetado')

    if (!col.fields.getByName('ebitda')) {
      col.fields.add(new NumberField({ name: 'ebitda' }))
    }
    if (!col.fields.getByName('tir')) {
      col.fields.add(new NumberField({ name: 'tir' }))
    }
    if (!col.fields.getByName('vpl_5anos')) {
      col.fields.add(new NumberField({ name: 'vpl_5anos' }))
    }
    if (!col.fields.getByName('vpl_10anos')) {
      col.fields.add(new NumberField({ name: 'vpl_10anos' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('dre_projetado')

    col.fields.removeByName('ebitda')
    col.fields.removeByName('tir')
    col.fields.removeByName('vpl_5anos')
    col.fields.removeByName('vpl_10anos')

    app.save(col)
  },
)
