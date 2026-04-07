onRecordAfterCreateSuccess((e) => {
  const analise = e.record
  const userId = analise.get('user_id')

  try {
    const clientes = $app.findRecordsByFilter(
      'clientes',
      `user_id = '${userId}' || email = '${$app.findRecordById('users', userId).get('email')}'`,
      '',
      1,
      0,
    )

    if (clientes.length > 0) {
      const clienteId = clientes[0].get('id')
      const projetos = $app.findRecordsByFilter(
        'projetos',
        `cliente_id = '${clienteId}'`,
        '-created',
        1,
        0,
      )

      if (projetos.length > 0) {
        const projeto = projetos[0]
        const fases = $app.findRecordsByFilter(
          'fases_projeto',
          `projeto_id = '${projeto.get('id')}' && numero_fase = 6`,
          '',
          1,
          0,
        )

        if (fases.length > 0) {
          const fase6 = fases[0]
          if (fase6.get('status') !== 'concluida') {
            fase6.set('status', 'concluida')
            fase6.set('data_conclusao', new Date().toISOString())
            $app.save(fase6)

            projeto.set('fase_atual', 7)
            $app.save(projeto)

            const nextFases = $app.findRecordsByFilter(
              'fases_projeto',
              `projeto_id = '${projeto.get('id')}' && numero_fase = 7`,
              '',
              1,
              0,
            )
            if (nextFases.length > 0) {
              const fase7 = nextFases[0]
              fase7.set('status', 'em_progresso')
              fase7.set('data_inicio', new Date().toISOString())
              $app.save(fase7)
            }
          }
        }
      }
    }
  } catch (err) {
    console.log('Erro auto-completing phase 6', err)
  }

  e.next()
}, 'historico_analises')
