migrate(
  (app) => {
    const instituicoes = new Collection({
      name: 'instituicoes_financeiras',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'telefone', type: 'text' },
        { name: 'contato', type: 'text' },
        { name: 'tipo', type: 'select', values: ['banco', 'financeira', 'cooperativa'] },
        { name: 'ativa', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(instituicoes)

    const projetosCol = app.findCollectionByNameOrId('projetos')

    const envios = new Collection({
      name: 'envios_instituicoes',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (projeto_id.cliente_id.parceiro_id = @request.auth.id || projeto_id.cliente_id.user_id = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (projeto_id.cliente_id.parceiro_id = @request.auth.id || projeto_id.cliente_id.user_id = @request.auth.id)",
      createRule: "@request.auth.id != '' && projeto_id.cliente_id.parceiro_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && projeto_id.cliente_id.parceiro_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && projeto_id.cliente_id.parceiro_id = @request.auth.id",
      fields: [
        {
          name: 'projeto_id',
          type: 'relation',
          required: true,
          collectionId: projetosCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'instituicao_id',
          type: 'relation',
          required: true,
          collectionId: instituicoes.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'data_envio', type: 'date' },
        { name: 'documentos_enviados', type: 'json' },
        {
          name: 'status',
          type: 'select',
          values: ['enviado', 'recebido', 'em_analise', 'aprovado', 'rejeitado'],
        },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(envios)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('envios_instituicoes'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('instituicoes_financeiras'))
    } catch (_) {}
  },
)
