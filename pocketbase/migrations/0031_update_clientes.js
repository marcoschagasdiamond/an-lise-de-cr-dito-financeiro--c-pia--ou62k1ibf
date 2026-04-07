migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')

    const newFields = [
      new TextField({ name: 'razao_social' }),
      new TextField({ name: 'cep' }),
      new TextField({ name: 'logradouro' }),
      new TextField({ name: 'numero' }),
      new TextField({ name: 'complemento' }),
      new TextField({ name: 'cidade' }),
      new TextField({ name: 'estado' }),
      new TextField({ name: 'ramo_atividade' }),
      new NumberField({ name: 'faturamento_estimado' }),
      new TextField({ name: 'contato_nome' }),
      new TextField({ name: 'contato_cargo' }),
      new EmailField({ name: 'contato_email' }),
      new TextField({ name: 'contato_telefone' }),
    ]

    for (const field of newFields) {
      if (!col.fields.getByName(field.name)) {
        col.fields.add(field)
      }
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('clientes')
    const names = [
      'razao_social',
      'cep',
      'logradouro',
      'numero',
      'complemento',
      'cidade',
      'estado',
      'ramo_atividade',
      'faturamento_estimado',
      'contato_nome',
      'contato_cargo',
      'contato_email',
      'contato_telefone',
    ]
    for (const name of names) {
      col.fields.removeByName(name)
    }
    app.save(col)
  },
)
