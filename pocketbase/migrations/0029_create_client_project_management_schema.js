migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    // 1. clientes
    const clientes = new Collection({
      name: 'clientes',
      type: 'base',
      listRule: "@request.auth.id != '' && parceiro_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && parceiro_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && parceiro_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && parceiro_id = @request.auth.id",
      fields: [
        {
          name: 'parceiro_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'telefone', type: 'text' },
        { name: 'cnpj', type: 'text' },
        { name: 'status', type: 'select', values: ['ativo', 'inativo'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(clientes)

    // 2. projetos
    const projetos = new Collection({
      name: 'projetos',
      type: 'base',
      listRule: "@request.auth.id != '' && cliente_id.parceiro_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && cliente_id.parceiro_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && cliente_id.parceiro_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && cliente_id.parceiro_id = @request.auth.id",
      fields: [
        {
          name: 'cliente_id',
          type: 'relation',
          required: true,
          collectionId: clientes.id,
          maxSelect: 1,
        },
        { name: 'fase_atual', type: 'number', min: 1, max: 9 },
        { name: 'data_inicio', type: 'date' },
        { name: 'data_atualizacao', type: 'date' },
        { name: 'valor_operacao', type: 'number' },
        {
          name: 'tipo_empresa',
          type: 'select',
          values: ['inicial', 'pequena', 'media_grande'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(projetos)

    // 3. fases_projeto
    const fasesProjeto = new Collection({
      name: 'fases_projeto',
      type: 'base',
      listRule: "@request.auth.id != '' && projeto_id.cliente_id.parceiro_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && projeto_id.cliente_id.parceiro_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && projeto_id.cliente_id.parceiro_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && projeto_id.cliente_id.parceiro_id = @request.auth.id",
      fields: [
        {
          name: 'projeto_id',
          type: 'relation',
          required: true,
          collectionId: projetos.id,
          maxSelect: 1,
        },
        { name: 'numero_fase', type: 'number' },
        { name: 'nome_fase', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'em_progresso', 'concluida'],
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date' },
        { name: 'data_conclusao', type: 'date' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(fasesProjeto)

    // 4. tarefas_fase
    const tarefasFase = new Collection({
      name: 'tarefas_fase',
      type: 'base',
      listRule:
        "@request.auth.id != '' && fase_id.projeto_id.cliente_id.parceiro_id = @request.auth.id",
      viewRule:
        "@request.auth.id != '' && fase_id.projeto_id.cliente_id.parceiro_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && fase_id.projeto_id.cliente_id.parceiro_id = @request.auth.id",
      deleteRule:
        "@request.auth.id != '' && fase_id.projeto_id.cliente_id.parceiro_id = @request.auth.id",
      fields: [
        {
          name: 'fase_id',
          type: 'relation',
          required: true,
          collectionId: fasesProjeto.id,
          maxSelect: 1,
        },
        { name: 'numero_tarefa', type: 'number' },
        { name: 'descricao', type: 'text' },
        { name: 'responsavel', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'em_progresso', 'concluida'],
          maxSelect: 1,
        },
        { name: 'data_vencimento', type: 'date' },
        { name: 'anexos', type: 'file', maxSelect: 99, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tarefasFase)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('tarefas_fase'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('fases_projeto'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('projetos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('clientes'))
    } catch (_) {}
  },
)
