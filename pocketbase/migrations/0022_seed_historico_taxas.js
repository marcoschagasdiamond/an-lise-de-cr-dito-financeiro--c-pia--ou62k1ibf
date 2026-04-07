migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('historico_taxas')

    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      const yearMonth = d.toISOString().substring(0, 7)

      try {
        app.findFirstRecordByFilter('historico_taxas', `data_atualizacao ~ '${yearMonth}'`)
        continue // Skip if already seeded for this month
      } catch (_) {}

      const dateStr = d.toISOString().replace('T', ' ').substring(0, 19) + 'Z'

      const record = new Record(col)
      record.set('data_atualizacao', dateStr)
      record.set('selic_12m', parseFloat((10.5 + Math.random() * 2 - 1).toFixed(2)))
      record.set('ipca_12m', parseFloat((3.9 + Math.random() * 1.5 - 0.75).toFixed(2)))
      record.set('cdi_12m', parseFloat((10.4 + Math.random() * 2 - 1).toFixed(2)))
      record.set('tr_12m', parseFloat((1.2 + Math.random() * 0.5 - 0.25).toFixed(2)))
      app.save(record)
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('historico_taxas')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
