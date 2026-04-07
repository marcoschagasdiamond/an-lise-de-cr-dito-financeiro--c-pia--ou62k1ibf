migrate(
  (app) => {
    const projetos = app.findCollectionByNameOrId('projetos')
    const collection = new Collection({
      name: 'pendencias',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (projeto_id.cliente_id.parceiro_id = @request.auth.id || projeto_id.cliente_id.user_id = @request.auth.id || projeto_id.cliente_id.email = @request.auth.email)",
      viewRule:
        "@request.auth.id != '' && (projeto_id.cliente_id.parceiro_id = @request.auth.id || projeto_id.cliente_id.user_id = @request.auth.id || projeto_id.cliente_id.email = @request.auth.email)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (projeto_id.cliente_id.parceiro_id = @request.auth.id || projeto_id.cliente_id.user_id = @request.auth.id || projeto_id.cliente_id.email = @request.auth.email)",
      deleteRule: "@request.auth.id != '' && projeto_id.cliente_id.parceiro_id = @request.auth.id",
      fields: [
        {
          name: 'projeto_id',
          type: 'relation',
          required: true,
          collectionId: projetos.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['tributaria', 'bacen', 'documentacao', 'outra'],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['aberta', 'em_resolucao', 'resolvida'],
          maxSelect: 1,
        },
        { name: 'data_resolucao', type: 'date' },
        { name: 'responsavel', type: 'text' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_pendencias_projeto ON pendencias (projeto_id)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('pendencias')
    app.delete(collection)
  },
)
