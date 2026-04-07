import { FinancialData } from '@/store/main'

export function calculateEBITDA(dre: FinancialData['dre'][0]) {
  if (!dre) return 0
  const lucroBruto =
    (dre.receita || 0) -
    (dre.impostosSobreVendas || 0) -
    (dre.devolucoesDescontosAbatimentos || 0) -
    (dre.cpv || 0)
  return (
    lucroBruto - (dre.despesasOperacionais || 0) + (dre.outrasReceitasOperacionaisTributaveis || 0)
  )
}

export function calculateCurrentExerciseAverages(dreList: FinancialData['dre'], currentDRE: any) {
  const latestDre =
    [...dreList]
      .sort((a, b) => b.year - a.year)
      .find((d) => d.receita > 0 || d.despesasOperacionais > 0) ||
    dreList[0] ||
    {}

  const {
    fiscal = {},
    current = {},
    percs = {},
    costConfig = 'manual',
    fiscalMonths = 12,
    currentMonths = 12,
  } = currentDRE || {}

  const fFat = latestDre.receita || 0
  const cFat = current.faturamento !== undefined ? current.faturamento : fFat

  const fDed =
    (latestDre.impostosSobreVendas || 0) + (latestDre.devolucoesDescontosAbatimentos || 0)
  const fCpv = latestDre.cpv || 0
  const fOutrasRec = latestDre.outrasReceitasOperacionaisTributaveis || 0

  const sumSub =
    (latestDre.despesasComPessoal || 0) +
    (latestDre.prestacaoServicosTerceiros || 0) +
    (latestDre.despesasComerciaisTributarias || 0) +
    (latestDre.despesasAdministrativas || 0) +
    (latestDre.outrasDespesasOperacionais || 0)
  const fDespOp = latestDre.despesasOperacionais || sumSub

  const fEbitda = fFat - fDed - fCpv - fDespOp + fOutrasRec

  const getC = (k: string, fv: number) => {
    return costConfig === 'auto'
      ? fFat
        ? (fv / fFat) * cFat
        : 0
      : current[k] !== undefined
        ? current[k]
        : fv
  }

  const cCpv = getC('cpv', fCpv)
  const cOutrasRec = getC('outras_receitas', fOutrasRec)

  const histDedPct = fFat ? (fDed / fFat) * 100 : 0
  const dp =
    costConfig === 'auto' ? histDedPct : percs.deducoes !== undefined ? percs.deducoes : histDedPct
  const cDed = cFat * (dp / 100)

  let cDespOpTotal = 0
  if (costConfig === 'auto') {
    cDespOpTotal = fFat ? (fDespOp / fFat) * cFat : 0
  } else {
    cDespOpTotal = [
      'desp_pessoal',
      'desp_servicos',
      'desp_comerciais',
      'desp_admin',
      'outras_desp',
    ].reduce((acc, key) => {
      const dbKey =
        key === 'desp_pessoal'
          ? 'despesasComPessoal'
          : key === 'desp_servicos'
            ? 'prestacaoServicosTerceiros'
            : key === 'desp_comerciais'
              ? 'despesasComerciaisTributarias'
              : key === 'desp_admin'
                ? 'despesasAdministrativas'
                : 'outrasDespesasOperacionais'
      const fVal = (latestDre[dbKey as keyof typeof latestDre] as number) || 0
      return acc + (current[key] !== undefined ? current[key] : fVal)
    }, 0)
  }

  const cEbitda = cFat - cDed - cCpv - cDespOpTotal + cOutrasRec

  const totalMonths =
    (typeof fiscalMonths === 'number' ? fiscalMonths : 0) +
    (typeof currentMonths === 'number' ? currentMonths : 0)

  let mFat = 0
  let mEbitda = 0

  if (totalMonths > 0) {
    mFat = (fFat + cFat) / totalMonths
    mEbitda = (fEbitda + cEbitda) / totalMonths
  }

  return { fFat, cFat, mFat, fEbitda, cEbitda, mEbitda }
}

export function calculateLiquidity(bp: FinancialData['balanceSheets'][0]) {
  const corrente = bp.passivoCirculante > 0 ? bp.ativoCirculante / bp.passivoCirculante : 0
  const seca =
    bp.passivoCirculante > 0 ? (bp.ativoCirculante - bp.estoques) / bp.passivoCirculante : 0

  const totalPassivo = bp.passivoCirculante + bp.passivoNaoCirculante
  const geral = totalPassivo > 0 ? (bp.ativoCirculante + bp.ativoNaoCirculante) / totalPassivo : 0

  return { corrente, seca, geral }
}

export function calculateRating(
  bpCurrent: FinancialData['balanceSheets'][0],
  dreCurrent: FinancialData['dre'][0],
  totalDebt: number,
): string {
  let score = 0

  // Liquidity Score (Max 40)
  const liq = calculateLiquidity(bpCurrent)
  if (liq.corrente > 1.5) score += 20
  else if (liq.corrente > 1.0) score += 10

  if (liq.seca > 1.0) score += 20
  else if (liq.seca > 0.8) score += 10

  // Profitability / EBITDA (Max 30)
  const ebitda = calculateEBITDA(dreCurrent)
  const margin = dreCurrent.receita > 0 ? ebitda / dreCurrent.receita : 0
  if (margin > 0.2) score += 30
  else if (margin > 0.1) score += 15

  // Leverage (Max 30)
  const equity = bpCurrent.patrimonioLiquido
  const leverage = equity > 0 ? totalDebt / equity : 999
  if (leverage < 0.5) score += 30
  else if (leverage < 1.0) score += 15

  if (score >= 80) return 'A+'
  if (score >= 65) return 'A'
  if (score >= 50) return 'B'
  if (score >= 35) return 'C'
  return 'D'
}

export function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(val)
}

export function formatPercent(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format(val)
}

export function ExcelFV(
  rate: number,
  nper: number,
  pmt: number,
  pv: number,
  type: number = 0,
): number {
  if (Math.abs(rate) < 1e-9) return -(pv + pmt * nper)
  const term = Math.pow(1 + rate, nper)
  return -(pv * term + (pmt * (1 + rate * type) * (term - 1)) / rate)
}

export function ExcelPV(
  rate: number,
  nper: number,
  pmt: number,
  fv: number,
  type: number = 0,
): number {
  if (Math.abs(rate) < 1e-9) return -(fv + pmt * nper)
  const term = Math.pow(1 + rate, nper)
  return -(fv + (pmt * (1 + rate * type) * (term - 1)) / rate) / term
}

export function ExcelPMT(
  rate: number,
  nper: number,
  pv: number,
  fv: number,
  type: number = 0,
): number {
  if (Math.abs(rate) < 1e-9) return -(pv + fv) / nper
  const term = Math.pow(1 + rate, nper)
  return -(rate * (fv + pv * term)) / ((1 + rate * type) * (term - 1))
}

export function ExcelNPER(
  rate: number,
  pmt: number,
  pv: number,
  fv: number,
  type: number = 0,
): number {
  if (Math.abs(rate) < 1e-9) return -(pv + fv) / pmt
  const num = pmt * (1 + rate * type) - fv * rate
  const den = pmt * (1 + rate * type) + pv * rate
  if (num / den < 0) return NaN
  return Math.log(num / den) / Math.log(1 + rate)
}

export function calculateIRR(values: number[], guess: number = 0.1): number {
  const maxIter = 100
  const tol = 1e-6
  let r = guess
  for (let i = 0; i < maxIter; i++) {
    let npv = 0
    let dnpv = 0
    for (let j = 0; j < values.length; j++) {
      npv += values[j] / Math.pow(1 + r, j)
      dnpv -= (j * values[j]) / Math.pow(1 + r, j + 1)
    }
    const newR = r - npv / dnpv
    if (Math.abs(newR - r) < tol) return newR
    r = newR
  }
  return r
}

export function calculateNPV(rate: number, values: number[]): number {
  return values.reduce((acc, val, i) => acc + val / Math.pow(1 + rate, i), 0)
}

export function calculatePayback(values: number[]): number {
  let cumulative = 0
  for (let i = 0; i < values.length; i++) {
    cumulative += values[i]
    if (cumulative >= 0) {
      if (i === 0) return 0
      const prev = cumulative - values[i]
      return i - 1 + Math.abs(prev) / values[i]
    }
  }
  return -1 // Never pays back
}

export function ExcelRATE(
  nper: number,
  pmt: number,
  pv: number,
  fv: number,
  type: number = 0,
  guess: number = 0.1,
): number {
  const epsMax = 1e-6
  let rate = guess
  const iterMax = 100

  const evalRate = (r: number) => {
    if (Math.abs(r) < 1e-9) return pv + pmt * nper + fv
    const term = Math.pow(1 + r, nper)
    return pv * term + (pmt * (1 + r * type) * (term - 1)) / r + fv
  }

  let y = evalRate(rate)
  if (Math.abs(y) < epsMax) return rate

  let x0 = guess
  let y0 = y
  let x1 = rate + 0.01
  let y1 = evalRate(x1)

  for (let i = 0; i < iterMax; i++) {
    if (Math.abs(y1 - y0) < epsMax) break
    rate = x1 - (y1 * (x1 - x0)) / (y1 - y0)
    y = evalRate(rate)
    if (Math.abs(y) < epsMax) return rate
    x0 = x1
    y0 = y1
    x1 = rate
    y1 = y
  }
  return rate
}
