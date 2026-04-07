migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    try {
      app.findAuthRecordByEmail('users', 'responsavel@demo.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('responsavel@demo.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Demo Responsável')
      record.set('role', 'responsavel')
      app.save(record)
    }

    try {
      app.findAuthRecordByEmail('users', 'assistente@demo.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('assistente@demo.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Demo Assistente')
      record.set('role', 'assistente')
      app.save(record)
    }
  },
  (app) => {},
)
