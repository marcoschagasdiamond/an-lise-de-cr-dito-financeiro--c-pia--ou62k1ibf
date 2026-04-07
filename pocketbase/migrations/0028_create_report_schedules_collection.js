migrate(
  (app) => {
    const stakeholdersCol = app.findCollectionByNameOrId('stakeholders')

    const collection = new Collection({
      name: 'report_schedules',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'frequency', type: 'select', required: true, values: ['weekly', 'monthly'] },
        {
          name: 'stakeholders',
          type: 'relation',
          required: false,
          collectionId: stakeholdersCol.id,
          maxSelect: 100,
        },
        { name: 'active', type: 'bool' },
        { name: 'last_run', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('report_schedules')
    app.delete(collection)
  },
)
