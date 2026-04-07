migrate(
  (app) => {
    const clientes = app.findCollectionByNameOrId('clientes')

    if (!clientes.fields.getByName('origem')) {
      clientes.fields.add(
        new SelectField({
          name: 'origem',
          values: ['solicitar_diagnostico', 'parceiro'],
        }),
      )
    }

    app.save(clientes)
  },
  (app) => {
    const clientes = app.findCollectionByNameOrId('clientes')
    clientes.fields.removeByName('origem')
    app.save(clientes)
  },
)
