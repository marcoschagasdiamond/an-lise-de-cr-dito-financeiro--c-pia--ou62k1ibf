migrate(
  (app) => {
    // Update simulacoes_financeiras indexer field to include 'igpm'
    const simCol = app.findCollectionByNameOrId('simulacoes_financeiras')
    const indexerField = simCol.fields.getByName('indexer')

    if (indexerField && !indexerField.values.includes('igpm')) {
      indexerField.values.push('igpm')
      app.save(simCol)
    }

    // Ensure historico_taxas has igpm_12m (idempotent validation)
    const histCol = app.findCollectionByNameOrId('historico_taxas')
    if (!histCol.fields.getByName('igpm_12m')) {
      histCol.fields.add(new NumberField({ name: 'igpm_12m', required: false }))
      app.save(histCol)
    }
  },
  (app) => {
    const simCol = app.findCollectionByNameOrId('simulacoes_financeiras')
    const indexerField = simCol.fields.getByName('indexer')

    if (indexerField && indexerField.values.includes('igpm')) {
      indexerField.values = indexerField.values.filter((v) => v !== 'igpm')
      app.save(simCol)
    }
  },
)
