routerAdd('OPTIONS', '/backend/v1/ai-analysis', (e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*')
  e.response.header().set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return e.noContent(204)
})

routerAdd(
  'POST',
  '/backend/v1/ai-analysis',
  (e) => {
    e.response.header().set('Access-Control-Allow-Origin', '*')
    e.response.header().set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    const body = e.requestInfo().body
    const category = body.category || 'Geral'

    const analysis = `Análise Gerada por Inteligência Artificial (${category}):\nOs dados demonstram a evolução dos indicadores nos exercícios analisados. Nota-se a importância de monitorar os resultados de curto prazo e a tendência das variações horizontais, que podem indicar pontos de atenção e oportunidades de melhoria na saúde financeira da empresa. Recomenda-se acompanhamento contínuo dos níveis de endividamento e liquidez para manter o alinhamento com o setor.`

    return e.json(200, { analysis })
  },
  $apis.requireAuth(),
)
