migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('instituicoes_financeiras')
    const banks = [
      { nome: 'Banco do Brasil', email: 'corporate@bb.com.br', tipo: 'banco', ativa: true },
      { nome: 'Itaú BBA', email: 'projetos@itaubba.com.br', tipo: 'banco', ativa: true },
      { nome: 'Sicredi', email: 'empresas@sicredi.com.br', tipo: 'cooperativa', ativa: true },
      { nome: 'Santander', email: 'corporate@santander.com.br', tipo: 'banco', ativa: true },
      { nome: 'BNDES', email: 'analise@bndes.gov.br', tipo: 'banco', ativa: true },
    ]

    for (const b of banks) {
      try {
        app.findFirstRecordByData('instituicoes_financeiras', 'nome', b.nome)
      } catch (_) {
        const record = new Record(col)
        record.set('nome', b.nome)
        record.set('email', b.email)
        record.set('tipo', b.tipo)
        record.set('ativa', b.ativa)
        app.save(record)
      }
    }
  },
  (app) => {
    // Seeding rollback isn't strictly necessary but good practice
    try {
      const col = app.findCollectionByNameOrId('instituicoes_financeiras')
      app.truncateCollection(col)
    } catch (_) {}
  },
)
