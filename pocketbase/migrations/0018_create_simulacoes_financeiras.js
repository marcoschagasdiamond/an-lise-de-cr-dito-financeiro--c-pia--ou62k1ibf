migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const collection = new Collection({
      name: 'simulacoes_financeiras',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'loan_value', type: 'number', required: true },
        { name: 'interest_rate', type: 'number', required: true },
        { name: 'term', type: 'number', required: true },
        {
          name: 'modality',
          type: 'select',
          required: true,
          values: ['antecipado', 'postecipado', 'diferido'],
          maxSelect: 1,
        },
        { name: 'grace_period', type: 'number' },
        { name: 'custos', type: 'json', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('simulacoes_financeiras')
    app.delete(collection)
  },
)
