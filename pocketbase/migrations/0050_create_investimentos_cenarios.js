migrate(
  (app) => {
    const collection = new Collection({
      name: 'investimentos_cenarios',
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
        {
          name: 'tipo',
          type: 'select',
          required: true,
          values: ['emprestimo', 'investidor', 'cotas'],
          maxSelect: 1,
        },
        { name: 'nome', type: 'text' },
        { name: 'valor', type: 'number', required: true },
        { name: 'taxa_juros', type: 'number' },
        { name: 'prazo', type: 'number' },
        { name: 'sistema_amortizacao', type: 'select', values: ['sac', 'price'], maxSelect: 1 },
        { name: 'data_inicio', type: 'date' },
        { name: 'participacao', type: 'number' },
        { name: 'tipo_retorno', type: 'select', values: ['dividendos', 'lucro'], maxSelect: 1 },
        { name: 'tipo_cota', type: 'select', values: ['diamond', 'gold', 'silver'], maxSelect: 1 },
        { name: 'quantidade_cotas', type: 'number' },
        { name: 'descricao_beneficios', type: 'text' },
        { name: 'retorno_esperado', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('investimentos_cenarios')
    app.delete(collection)
  },
)
