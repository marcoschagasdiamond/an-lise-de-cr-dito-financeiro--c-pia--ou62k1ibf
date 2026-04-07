migrate(
  (app) => {
    const col = new Collection({
      name: 'fases_padrao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'numero_fase', type: 'number', required: true },
        { name: 'nome_fase', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(col)

    const fases = [
      'Prospecção do Cliente',
      'Pré-análise',
      'Visita/Reunião com Analista',
      'Fechamento do Contrato',
      'Solicitação de Documentação',
      'Análises Financeiras',
      'Verificação de Pendências',
      'Desenvolvimento do Projeto',
      'Conferência e Envio para Instituições Financeiras',
    ]

    fases.forEach((nome, i) => {
      const record = new Record(col)
      record.set('numero_fase', i + 1)
      record.set('nome_fase', nome)
      app.save(record)
    })
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('fases_padrao'))
  },
)
