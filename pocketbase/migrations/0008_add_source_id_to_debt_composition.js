migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('debt_composition')
    col.fields.add(new TextField({ name: 'sourceId' }))
    app.save(col)

    try {
      const withAmort = app.findRecordsByFilter('bank_debts_amortization', '1=1', '', 1000, 0)
      const amortRecords = app.findRecordsByFilter(
        'debt_composition',
        "tableType='amortization'",
        '',
        1000,
        0,
      )
      const interestRecords = app.findRecordsByFilter(
        'debt_composition',
        "tableType='interest'",
        '',
        1000,
        0,
      )

      for (const source of withAmort) {
        const idx = source.get('rowIndex')

        const aRec = amortRecords.find((r) => r.get('rowIndex') === idx)
        if (aRec) {
          aRec.set('sourceId', source.id)
          app.save(aRec)
        }

        const iRec = interestRecords.find((r) => r.get('rowIndex') === idx)
        if (iRec) {
          iRec.set('sourceId', source.id)
          app.save(iRec)
        }
      }
    } catch (e) {}
  },
  (app) => {
    const col = app.findCollectionByNameOrId('debt_composition')
    col.fields.removeByName('sourceId')
    app.save(col)
  },
)
