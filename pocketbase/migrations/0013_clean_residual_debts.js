migrate(
  (app) => {
    try {
      const debtCol = app.findCollectionByNameOrId('debt_composition')
      app.truncateCollection(debtCol)
    } catch (e) {
      console.error(e)
    }

    try {
      const bankCol = app.findCollectionByNameOrId('bank_debts_amortization')
      app.truncateCollection(bankCol)
    } catch (e) {
      console.error(e)
    }
  },
  (app) => {
    // Irreversible data cleanup
  },
)
