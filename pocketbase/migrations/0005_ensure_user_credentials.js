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

    record.setPassword('securepassword123')
    record.setVerified(true)
    app.save(record)
  },
  (app) => {
    // Revert not strictly necessary for this credentials assertion
  },
)
