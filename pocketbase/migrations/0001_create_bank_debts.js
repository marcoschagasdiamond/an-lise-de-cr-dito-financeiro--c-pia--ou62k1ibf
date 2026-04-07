migrate(
  (app) => {
    const collection = new Collection({
      name: 'bank_debts_amortization',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'institution', type: 'text' },
        { name: 'contractedValue', type: 'number' },
        { name: 'amortizationSystem', type: 'text' },
        { name: 'paymentModality', type: 'text' },
        { name: 'totalPeriods', type: 'number' },
        { name: 'gracePeriod', type: 'number' },
        { name: 'remainingPeriods', type: 'number' },
        { name: 'interestRate', type: 'number' },
        { name: 'indexer', type: 'text' },
        { name: 'annualEstimate', type: 'number' },
        { name: 'monthlyEffectiveRate', type: 'number' },
        { name: 'monthlyPayment', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('bank_debts_amortization')
    app.delete(collection)
  },
)
