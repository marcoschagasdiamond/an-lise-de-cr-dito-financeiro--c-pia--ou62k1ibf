migrate(
  (app) => {
    const planos = new Collection({
      name: 'planos_negocio',
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
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome_projeto', type: 'text' },
        { name: 'apresentacao_empresa', type: 'editor' },
        { name: 'apresentacao_projeto', type: 'editor' },
        { name: 'mercado_justificativa', type: 'editor' },
        { name: 'config_dre', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(planos)

    const cenarios = new Collection({
      name: 'cenarios_financiamento',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'plano_negocio_id',
          type: 'relation',
          required: true,
          collectionId: planos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'tipo_cenario',
          type: 'select',
          required: true,
          values: ['emprestimo', 'investidor', 'cotas'],
          maxSelect: 1,
        },
        { name: 'ativo', type: 'bool' },
        { name: 'dados_cenario', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(cenarios)

    const dre = new Collection({
      name: 'dre_projetado',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'plano_negocio_id',
          type: 'relation',
          required: true,
          collectionId: planos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'ano', type: 'number', required: true },
        { name: 'receita', type: 'number' },
        { name: 'custos', type: 'number' },
        { name: 'resultado_operacional', type: 'number' },
        { name: 'despesas_financeiras', type: 'number' },
        { name: 'resultado_liquido', type: 'number' },
        { name: 'distribuicao_lucros', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_dre_plano ON dre_projetado (plano_negocio_id)'],
    })
    app.save(dre)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('dre_projetado'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('cenarios_financiamento'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('planos_negocio'))
    } catch (_) {}
  },
)
