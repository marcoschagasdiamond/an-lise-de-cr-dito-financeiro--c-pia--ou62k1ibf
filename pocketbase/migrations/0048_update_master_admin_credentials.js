migrate(
  (app) => {
    const email = 'marcoschagasdiamond@icloud.com'

    try {
      // Try to find the existing user
      const record = app.findAuthRecordByEmail('users', email)

      // Update the existing user with the requested credentials and status
      record.setPassword('Mac318180')
      record.set('role', 'administrador')
      record.set('status', 'ativo')
      record.setVerified(true)

      app.save(record)
    } catch (_) {
      // If the user doesn't exist, create a new one
      const users = app.findCollectionByNameOrId('users')
      const record = new Record(users)

      record.setEmail(email)
      record.setPassword('Mac318180')
      record.set('role', 'administrador')
      record.set('status', 'ativo')
      record.set('name', 'Master Admin')
      record.setVerified(true)

      app.save(record)
    }
  },
  (app) => {
    // Reverting passwords securely is not feasible.
    // We leave the down migration empty as the password change is forward-only.
  },
)
