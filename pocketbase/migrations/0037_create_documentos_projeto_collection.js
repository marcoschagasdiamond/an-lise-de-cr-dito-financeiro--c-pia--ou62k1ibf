migrate(
  (app) => {
    const projetos = app.findCollectionByNameOrId('projetos')
    const collection = new Collection({
      name: 'documentos_projeto',
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
          values: ['proposta', 'analise_financeira', 'fluxo_caixa', 'estruturacao', 'outra'],
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'arquivo', type: 'file', maxSelect: 1, maxSize: 20971520 },
        { name: 'versao', type: 'number', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'em_revisao', 'aprovado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_documentos_projeto ON documentos_projeto (projeto_id)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('documentos_projeto')
    app.delete(collection)
  },
)
