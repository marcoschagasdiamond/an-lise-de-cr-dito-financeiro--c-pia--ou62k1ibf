migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('financial_notes')
    if (!collection.fields.getByName('profile')) {
      collection.fields.add(
        new SelectField({
          name: 'profile',
          values: ['TÉCNICO', 'CONSERVADOR'],
          maxSelect: 1,
        }),
      )
    }
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('financial_notes')
    collection.fields.removeByName('profile')
    app.save(collection)
  },
)
