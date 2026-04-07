export async function generateFinancialAnalysis(
  section: 'Ativo' | 'Passivo' | 'Patrimônio Líquido' | 'DRE' | 'Receitas e Despesas',
  data: any[],
  userNotes: string,
  years: number[],
  tone: string = 'Técnico/Conservador',
) {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      let prefix = `Como contador sênior e analista de crédito com perfil técnico e conservador, analisei a seção de ${section}`

      if (tone === 'Didático/Executivo') {
        prefix = `Com uma visão gerencial e executiva, de forma didática, avaliei a seção de ${section}`
      }

      let specifics = `As variações identificadas nos valores e nas métricas de Análise Horizontal (A.H.) e Análise Vertical (A.V.)`

      if (section === 'DRE' || section === 'Receitas e Despesas') {
        specifics = `A evolução do Faturamento Bruto, a Margem EBITDA (A.V.) e as variações significativas nos custos e despesas operacionais (A.H.)`
      }

      resolve(
        `${prefix} referentes aos exercícios de ${years.join(
          ', ',
        )}. ${specifics}, combinadas com a sua observação ("${
          userNotes.length > 50 ? userNotes.substring(0, 50) + '...' : userNotes
        }"), revelam tendências de mercado consistentes com o setor. Os riscos potenciais parecem adequadamente gerenciados, refletindo um quadro de sustentabilidade e tendências de risco de crédito controladas para esta competência.`,
      )
    }, 1500)
  })
}
