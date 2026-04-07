migrate(
  (app) => {
    const parceiros = new Collection({
      name: 'parceiros',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (usuario_id = @request.auth.id || @request.auth.role = 'administrador')",
      viewRule:
        "@request.auth.id != '' && (usuario_id = @request.auth.id || @request.auth.role = 'administrador')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (usuario_id = @request.auth.id || @request.auth.role = 'administrador')",
      deleteRule: "@request.auth.role = 'administrador'",
      fields: [
        {
          name: 'usuario_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'nome_empresa', type: 'text', required: true },
        { name: 'cnpj', type: 'text', required: false },
        { name: 'email', type: 'email', required: false },
        { name: 'telefone', type: 'text', required: false },
        { name: 'cpf', type: 'text', required: false },
        {
          name: 'status',
          type: 'select',
          required: false,
          values: ['pendente', 'aprovado', 'rejeitado'],
        },
        { name: 'data_aprovacao', type: 'date', required: false },
        {
          name: 'aprovado_por',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(parceiros)
  },
  (app) => {
    const parceiros = app.findCollectionByNameOrId('parceiros')
    app.delete(parceiros)
  },
)
