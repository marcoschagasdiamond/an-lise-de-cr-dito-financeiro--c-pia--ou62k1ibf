import { IndicatorTable } from './IndicatorTable'

const INDICATORS = [
  'GIRO DOS ESTOQUES (anual)',
  'PRAZO MÉDIO DE ESTOCAGEM (em dias)',
  'GIRO DO ATIVO OPERACIONAL',
  'GIRO DE CONTAS A RECEBER (anual)',
  'PRAZO MÉDIO DE RECEB. DE VENDAS (em dias)',
  'PRAZO MÉDIO DE PAGTO. DE FORNECEDORES',
]

export function CicloOperacionalTable() {
  return (
    <IndicatorTable
      category="CICLO OPERACIONAL"
      title="CICLO OPERACIONAL"
      defaultIndicators={INDICATORS}
    />
  )
}
