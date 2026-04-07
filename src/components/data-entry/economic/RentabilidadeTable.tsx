import { IndicatorTable } from './IndicatorTable'

const INDICATORS = [
  'MARGEM BRUTA',
  'MARGEM LÍQUIDA',
  'RETORNO SOBRE O ATIVO',
  'RETORNO SOBRE OS INVESTIMENTOS',
  'RENTABILIDADE DO PATRIMÔNIO LÍQUIDO',
]

export function RentabilidadeTable() {
  return (
    <IndicatorTable category="RENTABILIDADE" title="RENTABILIDADE" defaultIndicators={INDICATORS} />
  )
}
