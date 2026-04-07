routerAdd(
  'POST',
  '/backend/v1/projetos/{id}/enviar-instituicao',
  (e) => {
    const projetoId = e.request.pathValue('id')
    const body = e.requestInfo().body
    const instituicaoId = body.instituicao_id
    const documentos = body.documentos_enviados || []

    if (!instituicaoId) {
      throw new BadRequestError('Instituição é obrigatória.')
    }

    const authRecord = e.auth
    if (!authRecord) {
      throw new UnauthorizedError('Authentication required.')
    }

    // Verify project exists (throws if not found)
    const projeto = $app.findRecordById('projetos', projetoId)
    const instituicao = $app.findRecordById('instituicoes_financeiras', instituicaoId)

    // Create the envio record
    const enviosCol = $app.findCollectionByNameOrId('envios_instituicoes')
    const novoEnvio = new Record(enviosCol)

    novoEnvio.set('projeto_id', projetoId)
    novoEnvio.set('instituicao_id', instituicaoId)
    novoEnvio.set('data_envio', new Date().toISOString())
    novoEnvio.set('status', 'enviado')
    novoEnvio.set('documentos_enviados', documentos)
    novoEnvio.set(
      'observacoes',
      'Enviado automaticamente pelo sistema. Aguardando retorno do banco.',
    )

    $app.save(novoEnvio)

    // Simulate sending email to the institution
    console.log(
      `Simulando envio de email para ${instituicao.getString('email')} referente ao projeto ${projetoId}`,
    )

    return e.json(200, { success: true, envio_id: novoEnvio.id })
  },
  $apis.requireAuth(),
)
