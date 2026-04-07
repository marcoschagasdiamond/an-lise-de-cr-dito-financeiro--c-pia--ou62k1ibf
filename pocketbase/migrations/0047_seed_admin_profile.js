migrate(
  (app) => {
    const adminCol = app.findCollectionByNameOrId('administradores')
    const user = app.findAuthRecordByEmail('users', 'marcoschagasdiamond@icloud.com')

    let adminRecord
    try {
      adminRecord = app.findFirstRecordByData('administradores', 'usuario_id', user.id)
    } catch (_) {
      adminRecord = new Record(adminCol)
      adminRecord.set('usuario_id', user.id)
    }

    adminRecord.set('nome', 'Marcos Chagas')
    adminRecord.set('email', 'marcoschagasdiamond@icloud.com')
    adminRecord.set('permissoes', ['*'])

    app.save(adminRecord)
  },
  (app) => {
    try {
      const user = app.findAuthRecordByEmail('users', 'marcoschagasdiamond@icloud.com')
      const adminRecord = app.findFirstRecordByData('administradores', 'usuario_id', user.id)
      app.delete(adminRecord)
    } catch (_) {}
  },
)
