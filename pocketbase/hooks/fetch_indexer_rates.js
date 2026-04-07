routerAdd('OPTIONS', '/backend/v1/fetch-indexer-rates', (e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*')
  e.response.header().set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return e.noContent(204)
})

routerAdd('GET', '/backend/v1/fetch-indexer-rates', (e) => {
  e.response.header().set('Access-Control-Allow-Origin', '*')
  e.response.header().set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  e.response.header().set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  const force = e.request.url.query().get('force') === 'true'

  let cachedRecord = null
  try {
    cachedRecord = $app.findFirstRecordByFilter('indexer_cache', "id != ''")
  } catch (_) {}

  const now = new Date()
  let shouldFetch = true

  if (cachedRecord && !force) {
    const lastFetch = new Date(cachedRecord.get('last_fetch').string())
    const diffHours = (now - lastFetch) / (1000 * 60 * 60)
    if (diffHours < 24) {
      shouldFetch = false
    }
  }

  if (!shouldFetch && cachedRecord) {
    return e.json(200, {
      rates: cachedRecord.get('rates'),
      last_fetch: cachedRecord.get('last_fetch').string(),
      cached: true,
    })
  }

  const fetchRate = (url, isSum) => {
    try {
      const res = $http.send({ url: url, method: 'GET', timeout: 5 })
      if (res.statusCode === 200) {
        const data = res.json
        if (isSum && Array.isArray(data)) {
          return data.reduce((acc, val) => acc + parseFloat(val.valor || 0), 0)
        }
        if (Array.isArray(data) && data.length > 0) {
          return parseFloat(data[data.length - 1].valor || 0)
        }
      }
    } catch (err) {
      console.log('Error fetching BCB:', err)
    }
    return 0
  }

  const selic =
    fetchRate('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1', false) || 10.5
  const cdi =
    fetchRate('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados/ultimos/1', false) || 10.4
  const ipca =
    fetchRate('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12', true) || 4.0
  const igpm =
    fetchRate('https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados/ultimos/12', true) || 4.5
  const tr =
    fetchRate('https://api.bcb.gov.br/dados/serie/bcdata.sgs.226/dados/ultimos/12', true) || 1.5

  const newRates = { SELIC: selic, CDI: cdi, IPCA: ipca, 'IGP-M': igpm, TR: tr, OUTROS: 0 }
  const fetchTimeStr = now.toISOString().replace('T', ' ').substring(0, 19) + 'Z'

  if (cachedRecord) {
    cachedRecord.set('rates', newRates)
    cachedRecord.set('last_fetch', fetchTimeStr)
    $app.save(cachedRecord)
  } else {
    try {
      const cacheCol = $app.findCollectionByNameOrId('indexer_cache')
      const newRecord = new Record(cacheCol)
      newRecord.set('rates', newRates)
      newRecord.set('last_fetch', fetchTimeStr)
      $app.save(newRecord)
    } catch (err) {
      console.log('Error saving cache', err)
    }
  }

  return e.json(200, {
    rates: newRates,
    last_fetch: fetchTimeStr,
    cached: false,
  })
})
