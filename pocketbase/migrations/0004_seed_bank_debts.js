migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('bank_debts_amortization')

    const seedData = [
      {
        institution: 'Banco do Brasil',
        contractedValue: 50000,
        amortizationSystem: 'SAC',
        paymentModality: 'Postecipado',
        totalPeriods: 48,
        gracePeriod: 6,
        remainingPeriods: 42,
        interestRate: 1.5,
        indexer: 'IPCA',
        annualEstimate: 4.5,
        monthlyEffectiveRate: 0.375,
        monthlyPayment: 1500,
      },
      {
        institution: 'Caixa Econômica Federal',
        contractedValue: 120000,
        amortizationSystem: 'Price',
        paymentModality: 'Postecipado',
        totalPeriods: 60,
        gracePeriod: 0,
        remainingPeriods: 60,
        interestRate: 1.2,
        indexer: 'CDI',
        annualEstimate: 10.5,
        monthlyEffectiveRate: 0.875,
        monthlyPayment: 2800,
      },
    ]

    seedData.forEach((data) => {
      const record = new Record(col)
      Object.entries(data).forEach(([k, v]) => {
        record.set(k, v)
      })
      app.save(record)
    })
  },
  (app) => {
    const col = app.findCollectionByNameOrId('bank_debts_amortization')
    const records = app.findRecordsByFilter(
      col.id,
      "institution = 'Banco do Brasil' || institution = 'Caixa Econômica Federal'",
      '',
      10,
      0,
    )
    records.forEach((r) => app.delete(r))
  },
)
