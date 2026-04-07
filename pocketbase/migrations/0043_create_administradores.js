migrate(
  (app) => {
    const administradores = new Collection({
      name: 'administradores',
      type: 'base',
      listRule: "@request.auth.role = 'administrador'",
      viewRule: "@request.auth.role = 'administrador'",
      createRule: "@request.auth.role = 'administrador'",
      updateRule: "@request.auth.role = 'administrador'",
      deleteRule: "@request.auth.role = 'administrador'",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'permissoes', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(administradores)
  },
  (app) => {
    const administradores = app.findCollectionByNameOrId('administradores')
    app.delete(administradores)
  },
)
