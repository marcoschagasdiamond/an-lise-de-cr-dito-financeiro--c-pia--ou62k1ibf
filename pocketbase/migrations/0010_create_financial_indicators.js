migrate(
  (app) => {
    const collection = new Collection({
      name: 'financial_indicators',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'indicator_name', type: 'text', required: true },
        { name: 'category', type: 'text', required: true },
        { name: 'val_2021', type: 'number' },
        { name: 'val_2022', type: 'number' },
        { name: 'ah_2022', type: 'number' },
        { name: 'val_2023', type: 'number' },
        { name: 'ah_2023', type: 'number' },
        { name: 'last_exercise', type: 'number' },
        { name: 'sector_performance', type: 'number' },
        { name: 'rowIndex', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('financial_indicators')
    app.delete(collection)
  },
)
