migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projetos')

    if (!col.fields.getByName('nome_projeto')) {
      col.fields.add(new TextField({ name: 'nome_projeto' }))
    }
    if (!col.fields.getByName('apresentacao_empresa')) {
      col.fields.add(new TextField({ name: 'apresentacao_empresa' }))
    }
    if (!col.fields.getByName('apresentacao_projeto')) {
      col.fields.add(new TextField({ name: 'apresentacao_projeto' }))
    }
    if (!col.fields.getByName('mercado_justificativa')) {
      col.fields.add(new TextField({ name: 'mercado_justificativa' }))
    }
    if (!col.fields.getByName('cenarios_ativos')) {
      col.fields.add(new JSONField({ name: 'cenarios_ativos' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projetos')
    col.fields.removeByName('nome_projeto')
    col.fields.removeByName('apresentacao_empresa')
    col.fields.removeByName('apresentacao_projeto')
    col.fields.removeByName('mercado_justificativa')
    col.fields.removeByName('cenarios_ativos')
    app.save(col)
  },
)
