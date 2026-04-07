migrate(
  (app) => {
    const col = new Collection({
      name: 'notificacoes',
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
          collectionId: app.findCollectionByNameOrId('users').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'projeto_id',
          type: 'relation',
          required: false,
          collectionId: app.findCollectionByNameOrId('projetos').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'mensagem', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['info', 'warning', 'success', 'error'],
          maxSelect: 1,
        },
        { name: 'lida', type: 'bool', required: false },
        { name: 'link', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('notificacoes'))
  },
)
