migrate(
  (app) => {
    const collection = new Collection({
      name: 'usuarios_responsaveis',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'administrador'",
      updateRule: "@request.auth.role = 'administrador'",
      deleteRule: "@request.auth.role = 'administrador'",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'telefone', type: 'text', required: false },
        { name: 'numero_whatsapp', type: 'text', required: false },
        { name: 'ativo', type: 'bool', required: false },
        { name: 'notificar_por_email', type: 'bool', required: false },
        { name: 'notificar_por_sms', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('usuarios_responsaveis')
    app.delete(collection)
  },
)
