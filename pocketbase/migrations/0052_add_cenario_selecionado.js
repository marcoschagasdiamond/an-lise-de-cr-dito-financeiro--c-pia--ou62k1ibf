migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('projetos')

    if (!col.fields.getByName('cenario_selecionado')) {
      col.fields.add(
        new SelectField({
          name: 'cenario_selecionado',
          values: ['emprestimos', 'investidor', 'cotas'],
          required: false,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('projetos')
    col.fields.removeByName('cenario_selecionado')
    app.save(col)
  },
)
