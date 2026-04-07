migrate(
  (app) => {
    let user
    try {
      user = app.findAuthRecordByEmail('users', 'marcoschagasdiamond@icloud.com')
    } catch (_) {
      // Seeder user not found, skip.
      return
    }

    // 1. Seed Client
    let existingClient
    try {
      existingClient = app.findFirstRecordByData('clientes', 'nome', 'Empresa Exemplo S.A.')
    } catch (_) {
      const clientesCol = app.findCollectionByNameOrId('clientes')
      existingClient = new Record(clientesCol)
      existingClient.set('parceiro_id', user.id)
      existingClient.set('nome', 'Empresa Exemplo S.A.')
      existingClient.set('email', 'contato@exemplo.com.br')
      existingClient.set('telefone', '(11) 99999-9999')
      existingClient.set('cnpj', '12.345.678/0001-90')
      existingClient.set('status', 'ativo')
      app.save(existingClient)
    }

    // 2. Seed Project
    let existingProject
    try {
      existingProject = app.findFirstRecordByData('projetos', 'cliente_id', existingClient.id)
    } catch (_) {
      const projetosCol = app.findCollectionByNameOrId('projetos')
      existingProject = new Record(projetosCol)
      existingProject.set('cliente_id', existingClient.id)
      existingProject.set('fase_atual', 2)
      existingProject.set('data_inicio', new Date().toISOString())
      existingProject.set('data_atualizacao', new Date().toISOString())
      existingProject.set('valor_operacao', 1500000)
      existingProject.set('tipo_empresa', 'media_grande')
      app.save(existingProject)
    }

    // 3. Seed Phase
    let existingPhase
    try {
      existingPhase = app.findFirstRecordByData('fases_projeto', 'projeto_id', existingProject.id)
    } catch (_) {
      const fasesCol = app.findCollectionByNameOrId('fases_projeto')
      existingPhase = new Record(fasesCol)
      existingPhase.set('projeto_id', existingProject.id)
      existingPhase.set('numero_fase', 1)
      existingPhase.set('nome_fase', 'Diagnóstico Inicial')
      existingPhase.set('status', 'concluida')
      existingPhase.set('data_inicio', new Date().toISOString())
      existingPhase.set('data_conclusao', new Date().toISOString())
      existingPhase.set('observacoes', 'Diagnóstico realizado com sucesso.')
      app.save(existingPhase)
    }

    // 4. Seed Task
    try {
      app.findFirstRecordByData('tarefas_fase', 'fase_id', existingPhase.id)
    } catch (_) {
      const tarefasCol = app.findCollectionByNameOrId('tarefas_fase')
      const tarefa = new Record(tarefasCol)
      tarefa.set('fase_id', existingPhase.id)
      tarefa.set('numero_tarefa', 1)
      tarefa.set('descricao', 'Coletar documentos financeiros')
      tarefa.set('responsavel', 'Analista Financeiro')
      tarefa.set('status', 'concluida')
      tarefa.set('data_vencimento', new Date().toISOString())
      app.save(tarefa)
    }
  },
  (app) => {
    try {
      const records = app.findRecordsByFilter('clientes', "nome = 'Empresa Exemplo S.A.'", '', 1, 0)
      if (records.length > 0) {
        const client = records[0]
        const projects = app.findRecordsByFilter(
          'projetos',
          `cliente_id = '${client.id}'`,
          '',
          100,
          0,
        )
        for (const p of projects) {
          const phases = app.findRecordsByFilter(
            'fases_projeto',
            `projeto_id = '${p.id}'`,
            '',
            100,
            0,
          )
          for (const f of phases) {
            const tasks = app.findRecordsByFilter('tarefas_fase', `fase_id = '${f.id}'`, '', 100, 0)
            for (const t of tasks) app.delete(t)
            app.delete(f)
          }
          app.delete(p)
        }
        app.delete(client)
      }
    } catch (_) {}
  },
)
