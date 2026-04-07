routerAdd('OPTIONS', '/backend/v1/fetch-indexer-history', (e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*')
  e.response.header().set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return e.noContent(204)
})

routerAdd('GET', '/backend/v1/fetch-indexer-history', (e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*')
  e.response.header().set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  const fetchSeries = (url) => {
    try {
      const res = $http.send({ url: url, method: 'GET', timeout: 5 })
      if (res.statusCode === 200) {
        return res.json
      }
    } catch (err) {
      console.log('Error fetching BCB:', err)
    }
    return []
  }

  const selic = fetchSeries(
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/12?formato=json',
  )
  const ipca = fetchSeries(
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json',
  )

  return e.json(200, { selic, ipca })
})
