routerAdd('POST', '/backend/v1/diagnostic/submit', (e) => {
  const body = e.requestInfo().body
  const col = $app.findCollectionByNameOrId('clientes')
  const record = new Record(col)

  record.set('nome', body.nomeEmpresa)
  record.set('razao_social', body.nomeEmpresa)
  record.set('cnpj', body.cnpj)
  record.set('email', body.email)
  record.set('telefone', body.telefone)
  record.set('nome_responsavel', body.nomeResponsavel)

  let valor = 0
  if (body.valorCaptacao) {
    valor = parseFloat(body.valorCaptacao.replace(/\D/g, '')) / 100
  }
  record.set('valor_captacao', valor)
  record.set('prazo_desejado', body.prazoDesejado)
  record.set('descricao', body.descricao)
  record.set('origem', 'solicitar_diagnostico')
  record.set('status', 'ativo')
  record.set('comissao_gerada', false)

  $app.save(record)

  return e.json(200, { success: true, id: record.id })
})
