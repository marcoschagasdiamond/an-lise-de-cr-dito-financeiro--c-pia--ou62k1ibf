migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.updateRule = "id = @request.auth.id || @request.auth.role = 'administrador'"
    usersCol.deleteRule = "id = @request.auth.id || @request.auth.role = 'administrador'"
    app.save(usersCol)

    const clientesCol = app.findCollectionByNameOrId('clientes')
    clientesCol.updateRule =
      "@request.auth.id != '' && (parceiro_id = @request.auth.id || @request.auth.role = 'administrador')"
    clientesCol.deleteRule =
      "@request.auth.id != '' && (parceiro_id = @request.auth.id || @request.auth.role = 'administrador')"
    clientesCol.listRule =
      "@request.auth.id != '' && (parceiro_id = @request.auth.id || user_id = @request.auth.id || email = @request.auth.email || @request.auth.role = 'administrador')"
    clientesCol.viewRule =
      "@request.auth.id != '' && (parceiro_id = @request.auth.id || user_id = @request.auth.id || email = @request.auth.email || @request.auth.role = 'administrador')"
    app.save(clientesCol)

    const projetosCol = app.findCollectionByNameOrId('projetos')
    projetosCol.listRule =
      "@request.auth.id != '' && (cliente_id.parceiro_id = @request.auth.id || cliente_id.user_id = @request.auth.id || cliente_id.email = @request.auth.email || @request.auth.role = 'administrador')"
    projetosCol.viewRule =
      "@request.auth.id != '' && (cliente_id.parceiro_id = @request.auth.id || cliente_id.user_id = @request.auth.id || cliente_id.email = @request.auth.email || @request.auth.role = 'administrador')"
    app.save(projetosCol)

    try {
      const adminUser = app.findAuthRecordByEmail('users', 'marcoschagasdiamond@icloud.com')
      adminUser.set('role', 'administrador')
      adminUser.set('status', 'ativo')
      app.save(adminUser)

      const administradoresCol = app.findCollectionByNameOrId('administradores')
      let adminRecord
      try {
        adminRecord = app.findFirstRecordByData('administradores', 'usuario_id', adminUser.id)
      } catch (_) {
        adminRecord = new Record(administradoresCol)
        adminRecord.set('usuario_id', adminUser.id)
      }

      adminRecord.set('nome', adminUser.get('name') || 'Marcos Chagas')
      adminRecord.set('email', adminUser.get('email'))
      adminRecord.set('permissoes', [
        'gerenciar_parceiros',
        'gerenciar_clientes',
        'gerenciar_admins',
      ])

      app.save(adminRecord)
    } catch (e) {
      // User not seeded or does not exist, ignore safely
    }
  },
  (app) => {
    const usersCol = app.findCollectionByNameOrId('users')
    usersCol.updateRule = 'id = @request.auth.id'
    usersCol.deleteRule = 'id = @request.auth.id'
    app.save(usersCol)

    const clientesCol = app.findCollectionByNameOrId('clientes')
    clientesCol.updateRule = "@request.auth.id != '' && parceiro_id = @request.auth.id"
    clientesCol.deleteRule = "@request.auth.id != '' && parceiro_id = @request.auth.id"
    clientesCol.listRule =
      "@request.auth.id != '' && (parceiro_id = @request.auth.id || user_id = @request.auth.id || email = @request.auth.email)"
    clientesCol.viewRule =
      "@request.auth.id != '' && (parceiro_id = @request.auth.id || user_id = @request.auth.id || email = @request.auth.email)"
    app.save(clientesCol)

    const projetosCol = app.findCollectionByNameOrId('projetos')
    projetosCol.listRule =
      "@request.auth.id != '' && (cliente_id.parceiro_id = @request.auth.id || cliente_id.user_id = @request.auth.id || cliente_id.email = @request.auth.email)"
    projetosCol.viewRule =
      "@request.auth.id != '' && (cliente_id.parceiro_id = @request.auth.id || cliente_id.user_id = @request.auth.id || cliente_id.email = @request.auth.email)"
    app.save(projetosCol)
  },
)
