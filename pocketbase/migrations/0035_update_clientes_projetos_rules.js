migrate(
  (app) => {
    const clientes = app.findCollectionByNameOrId('clientes')
    if (!clientes.fields.getByName('user_id')) {
      clientes.fields.add(
        new RelationField({
          name: 'user_id',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
    }
    clientes.listRule =
      "@request.auth.id != '' && (parceiro_id = @request.auth.id || user_id = @request.auth.id || email = @request.auth.email)"
    clientes.viewRule =
      "@request.auth.id != '' && (parceiro_id = @request.auth.id || user_id = @request.auth.id || email = @request.auth.email)"
    app.save(clientes)

    const projetos = app.findCollectionByNameOrId('projetos')
    projetos.listRule =
      "@request.auth.id != '' && (cliente_id.parceiro_id = @request.auth.id || cliente_id.user_id = @request.auth.id || cliente_id.email = @request.auth.email)"
    projetos.viewRule =
      "@request.auth.id != '' && (cliente_id.parceiro_id = @request.auth.id || cliente_id.user_id = @request.auth.id || cliente_id.email = @request.auth.email)"
    app.save(projetos)

    const fases = app.findCollectionByNameOrId('fases_projeto')
    fases.listRule =
      "@request.auth.id != '' && (projeto_id.cliente_id.parceiro_id = @request.auth.id || projeto_id.cliente_id.user_id = @request.auth.id || projeto_id.cliente_id.email = @request.auth.email)"
    fases.viewRule =
      "@request.auth.id != '' && (projeto_id.cliente_id.parceiro_id = @request.auth.id || projeto_id.cliente_id.user_id = @request.auth.id || projeto_id.cliente_id.email = @request.auth.email)"
    app.save(fases)

    const tarefas = app.findCollectionByNameOrId('tarefas_fase')
    tarefas.listRule =
      "@request.auth.id != '' && (fase_id.projeto_id.cliente_id.parceiro_id = @request.auth.id || fase_id.projeto_id.cliente_id.user_id = @request.auth.id || fase_id.projeto_id.cliente_id.email = @request.auth.email)"
    tarefas.viewRule =
      "@request.auth.id != '' && (fase_id.projeto_id.cliente_id.parceiro_id = @request.auth.id || fase_id.projeto_id.cliente_id.user_id = @request.auth.id || fase_id.projeto_id.cliente_id.email = @request.auth.email)"
    tarefas.updateRule =
      "@request.auth.id != '' && (fase_id.projeto_id.cliente_id.parceiro_id = @request.auth.id || fase_id.projeto_id.cliente_id.user_id = @request.auth.id || fase_id.projeto_id.cliente_id.email = @request.auth.email)"
    app.save(tarefas)
  },
  (app) => {
    // Revert logic omitted for brevity
  },
)
