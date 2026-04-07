migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    const record = new Record(users)
    record.setEmail('marcoschagasdiamond@icloud.com')
    record.setPassword('securepassword123')
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
