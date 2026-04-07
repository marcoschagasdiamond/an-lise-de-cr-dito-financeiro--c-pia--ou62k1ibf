onRecordAfterCreateSuccess((e) => {
  const projeto = e.record
  const fasesPadrao = $app.findRecordsByFilter('fases_padrao', '1=1', 'numero_fase', 20, 0)
  const fasesCol = $app.findCollectionByNameOrId('fases_projeto')

  for (const padrao of fasesPadrao) {
    const numFase = padrao.get('numero_fase')
    const fase = new Record(fasesCol)
    fase.set('projeto_id', projeto.id)
    fase.set('numero_fase', numFase)
    fase.set('nome_fase', padrao.get('nome_fase'))

    if (numFase === 1) {
      fase.set('status', 'em_progresso')
      fase.set('data_inicio', new Date().toISOString())
    } else {
      fase.set('status', 'pendente')
    }

    $app.save(fase)
  }

  e.next()
}, 'projetos')
