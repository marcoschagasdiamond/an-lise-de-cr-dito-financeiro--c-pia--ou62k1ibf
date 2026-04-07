migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['cliente', 'parceiro', 'administrador']
    }

    if (!users.fields.getByName('status')) {
      users.fields.add(
        new SelectField({
          name: 'status',
          values: ['ativo', 'pendente_aprovacao', 'rejeitado'],
        }),
      )
    }

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['cliente', 'parceiro']
    }

    users.fields.removeByName('status')

    app.save(users)
  },
)
