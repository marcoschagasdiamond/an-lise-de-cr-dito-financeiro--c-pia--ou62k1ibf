migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['cliente', 'parceiro', 'administrador', 'assistente', 'responsavel']
    }
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const roleField = users.fields.getByName('role')
    if (roleField) {
      roleField.values = ['cliente', 'parceiro', 'administrador']
    }
    app.save(users)
  },
)
