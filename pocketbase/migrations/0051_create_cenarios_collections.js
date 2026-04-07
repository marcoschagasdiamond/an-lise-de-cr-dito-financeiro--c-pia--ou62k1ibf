migrate(
  (app) => {
    const usersColId = app.findCollectionByNameOrId('_pb_users_auth_').id
    const projetosColId = app.findCollectionByNameOrId('projetos').id

    const emprestimos = new Collection({
      name: 'cenarios_emprestimos',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersColId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'projeto_id',
          type: 'relation',
          required: false,
          collectionId: projetosColId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'banco', type: 'text', required: true },
        { name: 'valor', type: 'number', required: true },
        { name: 'taxa_juros', type: 'number', required: true },
        { name: 'prazo', type: 'number', required: true },
        {
          name: 'tipo_amortizacao',
          type: 'select',
          required: true,
          values: ['sac', 'price'],
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date', required: false },
        { name: 'tabela_amortizacao', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(emprestimos)

    const investidor = new Collection({
      name: 'cenarios_investidor',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersColId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'projeto_id',
          type: 'relation',
          required: false,
          collectionId: projetosColId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome_investidor', type: 'text', required: true },
        { name: 'valor_aporte', type: 'number', required: true },
        { name: 'participacao_acionaria', type: 'number', required: true },
        {
          name: 'tipo_retorno',
          type: 'select',
          required: true,
          values: ['dividendos', 'lucro'],
          maxSelect: 1,
        },
        { name: 'prazo_saida', type: 'number', required: true },
        { name: 'retorno_esperado', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(investidor)

    const cotas = new Collection({
      name: 'cenarios_cotas',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: usersColId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'projeto_id',
          type: 'relation',
          required: false,
          collectionId: projetosColId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo_cota',
          type: 'select',
          required: true,
          values: ['diamond', 'gold', 'silver'],
          maxSelect: 1,
        },
        { name: 'valor_cota', type: 'number', required: true },
        { name: 'quantidade', type: 'number', required: true },
        { name: 'valor_total', type: 'number', required: true },
        { name: 'beneficios', type: 'text', required: false },
        { name: 'retorno_esperado', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cotas)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('cenarios_emprestimos'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('cenarios_investidor'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('cenarios_cotas'))
    } catch (_) {}
  },
)
