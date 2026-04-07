migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('tarefas_fase')
    const statusField = col.fields.getByName('status')
    statusField.values = [
      'pendente',
      'em_progresso',
      'concluida',
      'enviado',
      'aprovado',
      'rejeitado',
    ]

    if (!col.fields.getByName('observacoes')) {
      col.fields.add(
        new TextField({
          name: 'observacoes',
        }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('tarefas_fase')
    const statusField = col.fields.getByName('status')
    statusField.values = ['pendente', 'em_progresso', 'concluida']
    if (col.fields.getByName('observacoes')) {
      col.fields.removeByName('observacoes')
    }
    app.save(col)
  },
)
