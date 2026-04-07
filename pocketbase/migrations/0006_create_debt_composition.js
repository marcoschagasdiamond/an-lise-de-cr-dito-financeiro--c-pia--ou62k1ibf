migrate(
  (app) => {
    const collection = new Collection({
      name: 'debt_composition',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'tableType', type: 'text', required: true },
        { name: 'rowIndex', type: 'number', required: true },
        { name: 'creditor', type: 'text' },
        { name: 'col0', type: 'text' },
        { name: 'col1', type: 'text' },
        { name: 'col2', type: 'text' },
        { name: 'col3', type: 'text' },
        { name: 'col4', type: 'text' },
        { name: 'col5', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('debt_composition')
    app.delete(collection)
  },
)
