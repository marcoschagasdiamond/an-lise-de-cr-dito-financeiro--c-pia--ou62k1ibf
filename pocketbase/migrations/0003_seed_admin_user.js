migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const record = new Record(users)
    record.setemail('Marcoschagasdiasmond@icloud.com')
    record.setPassword('Mac318180')
    record.setVerified(true)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('users', 'marcoschagasdiamond@icloud.com')
      app.delete(record)
    } catch (_) {}
  },
)
