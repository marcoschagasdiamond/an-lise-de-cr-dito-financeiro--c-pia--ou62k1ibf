migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    let record
    try {
      record = app.findAuthRecordByEmail('users', 'marcoschagasdiamond@icloud.com')
    } catch (_) {
      record = new Record(users)
      record.setEmail('marcoschagasdiamond@icloud.com')
    }

    record.setPassword('Mac3181810')
    record.setVerified(true)
    record.set('name', 'Marcos Chagas')
    record.set('role', 'administrador')
    record.set('status', 'ativo')

    app.save(record)
  },
  (app) => {
    // Cannot easily restore previous password without tracking state, intentionally left empty
  },
)
