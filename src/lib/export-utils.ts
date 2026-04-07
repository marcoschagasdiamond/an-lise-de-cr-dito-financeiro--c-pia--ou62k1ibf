import { BalanceSheet } from '@/store/main'

export function exportAmortizationToCSV(
  parameters: Record<string, string>,
  rows: any[],
  filename: string,
) {
  const fmtNum = (n: number) => n.toFixed(2).replace('.', ',')

  let csv = 'Parâmetro;Valor\n'
  Object.entries(parameters).forEach(([k, v]) => {
    csv += `"${k}";"${v}"\n`
  })
  csv += '\n'

  csv +=
    'Número da Prestação;Data do Pagamento;Saldo Devedor Inicial;Juros da Prestação;Amortização;Valor da Prestação;Saldo Devedor Final\n'
  rows.forEach((r) => {
    const dateStr =
      typeof r.date === 'string' ? r.date : new Intl.DateTimeFormat('pt-BR').format(r.date)
    csv += `${r.period};"${dateStr}";"${fmtNum(r.initialBalance)}";"${fmtNum(r.interest)}";"${fmtNum(r.amortization)}";"${fmtNum(r.pmt)}";"${fmtNum(r.finalBalance)}"\n`
  })

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportBalanceSheetToExcel(
  balanceSheets: BalanceSheet[],
  years: number[],
  companyName: string = '',
) {
  const getTotals = (y: number) => {
    const bp = balanceSheets.find((b) => b.year === y)
    if (!bp) return { ac: 0, anc: 0, pc: 0, pnc: 0, pl: 0, ativo: 0, passivo: 0, totalPassivoPL: 0 }
    const ac = bp.ativoCirculante || 0
    const anc = bp.ativoNaoCirculante || 0
    const pc = bp.passivoCirculante || 0
    const pnc = bp.passivoNaoCirculante || 0
    const pl = bp.patrimonioLiquido || 0
    return {
      ac,
      anc,
      pc,
      pnc,
      pl,
      ativo: ac + anc,
      passivo: pc + pnc,
      totalPassivoPL: pc + pnc + pl,
    }
  }

  const fmtAV = (val: number, total: number) => {
    if (total === 0) return '0,0%'
    return ((val / total) * 100).toFixed(2).replace('.', ',') + '%'
  }

  const fmtAH = (val: number, prevVal: number) => {
    if (prevVal === 0) return val === 0 ? '0,0%' : '-'
    return ((val / prevVal - 1) * 100).toFixed(2).replace('.', ',') + '%'
  }

  let table = '<table border="1" style="font-family: sans-serif; border-collapse: collapse;">'
  table += '<tr><th style="background-color: #8faadc; color: black; padding: 5px;">Conta</th>'
  years.forEach((y) => {
    table += `<th style="background-color: #8faadc; color: black; padding: 5px;">${y}</th>`
    table += `<th style="background-color: #8faadc; color: black; padding: 5px;">A.V. (%)</th>`
    table += `<th style="background-color: #8faadc; color: black; padding: 5px;">A.H. (%)</th>`
  })
  table += '</tr>'

  const addRow = (
    label: string,
    key: keyof BalanceSheet | null,
    totalKey: 'ativo' | 'totalPassivoPL',
    isHeader: boolean = false,
  ) => {
    table += `<tr ${isHeader ? 'style="font-weight: bold; background-color: #b4c7e7;"' : ''}>`
    table += `<td style="padding: 5px;">${label}</td>`
    years.forEach((y, i) => {
      const bp = balanceSheets.find((b) => b.year === y)
      const val = key ? (bp?.[key] as number) || 0 : 0
      const totals = getTotals(y)
      const total = totals[totalKey]

      let prevVal = 0
      if (i > 0 && key) {
        const prevBp = balanceSheets.find((b) => b.year === years[i - 1])
        prevVal = (prevBp?.[key] as number) || 0
      }

      if (key) {
        table += `<td style="padding: 5px;">${val.toFixed(2).replace('.', ',')}</td>`
        table += `<td style="padding: 5px;">${fmtAV(val, total)}</td>`
        table += `<td style="padding: 5px;">${i > 0 ? fmtAH(val, prevVal) : '-'}</td>`
      } else {
        table += `<td style="padding: 5px;"></td><td style="padding: 5px;"></td><td style="padding: 5px;"></td>`
      }
    })
    table += '</tr>'
  }

  const addTotalRow = (label: string, totalKey: 'ativo' | 'totalPassivoPL') => {
    table += `<tr style="font-weight: bold; background-color: #8eaadb;">`
    table += `<td style="padding: 5px;">${label}</td>`
    years.forEach((y, i) => {
      const totals = getTotals(y)
      const val = totals[totalKey]

      let prevVal = 0
      if (i > 0) {
        const prevTotals = getTotals(years[i - 1])
        prevVal = prevTotals[totalKey]
      }

      table += `<td style="padding: 5px;">${val.toFixed(2).replace('.', ',')}</td>`
      table += `<td style="padding: 5px;">100,00%</td>`
      table += `<td style="padding: 5px;">${i > 0 ? fmtAH(val, prevVal) : '-'}</td>`
    })
    table += '</tr>'
  }

  table +=
    '<tr><td colspan="' +
    (1 + years.length * 3) +
    '" style="font-weight: bold; background-color: #d9e1f2; padding: 5px; text-align: center;">ATIVO</td></tr>'

  addRow('ATIVO CIRCULANTE', 'ativoCirculante', 'ativo', true)
  addRow('Disponibilidades', 'disponibilidades', 'ativo')
  addRow('Aplicações Financeiras', 'aplicacoesFinanceiras', 'ativo')
  addRow('Clientes a Receber', 'clientesAReceber', 'ativo')
  addRow('(-) Provisão Devedores Duvidosos', 'provisaoDevedoresDuvidosos', 'ativo')
  addRow('Estoques', 'estoques', 'ativo')
  addRow('Despesas Antecipadas', 'despesasAntecipadas', 'ativo')
  addRow('Outros Realizáveis Curto Prazo', 'outrosRealizaveisCurtoPrazo', 'ativo')

  addRow('ATIVO NÃO-CIRCULANTE', 'ativoNaoCirculante', 'ativo', true)
  addRow('Realizável a Longo Prazo', 'realizavelALongoPrazo', 'ativo')
  addRow('Investimentos', 'investimentos', 'ativo')
  addRow('Imobilizado', 'imobilizado', 'ativo')
  addRow('(-) Depreciação Acumulada', 'depreciacaoAcumulada', 'ativo')
  addRow('Outros Ativos Não-Circulantes', 'outrosAtivosNaoCirculantes', 'ativo')

  addTotalRow('ATIVO TOTAL', 'ativo')

  table +=
    '<tr><td colspan="' +
    (1 + years.length * 3) +
    '" style="font-weight: bold; background-color: #d9e1f2; padding: 5px; text-align: center;">PASSIVO E PATRIMÔNIO LÍQUIDO</td></tr>'

  addRow('PASSIVO CIRCULANTE', 'passivoCirculante', 'totalPassivoPL', true)
  addRow('Fornecedores', 'fornecedores', 'totalPassivoPL')
  addRow('Obrigações Fiscais e Trabalhistas', 'obrigacoesFiscaisTrabalhistas', 'totalPassivoPL')
  addRow('Adiantamento de Clientes', 'adiantamentoClientes', 'totalPassivoPL')
  addRow('Provisão Impostos', 'provisaoImpostos', 'totalPassivoPL')
  addRow('Empréstimos e Financiamentos CP', 'emprestimosFinanciamentosCP', 'totalPassivoPL')
  addRow('Duplicatas Descontadas', 'duplicatasDescontadas', 'totalPassivoPL')
  addRow('Outras Obrigações Circulantes', 'outrasObrigacoesCirculantes', 'totalPassivoPL')

  addRow('PASSIVO NÃO-CIRCULANTE', 'passivoNaoCirculante', 'totalPassivoPL', true)
  addRow('Empréstimos e Financiamentos LP', 'emprestimosFinanciamentosLP', 'totalPassivoPL')
  addRow('Outras Obrigações Não-Circulantes', 'outrasObrigacoesNaoCirculantes', 'totalPassivoPL')

  addRow('PATRIMÔNIO LÍQUIDO TOTAL', 'patrimonioLiquido', 'totalPassivoPL', true)
  addRow('Capital Social', 'capitalSocial', 'totalPassivoPL')
  addRow('Reservas', 'reservas', 'totalPassivoPL')
  addRow('Lucros e Prejuízos Acumulados', 'lucrosPrejuizosAcumulados', 'totalPassivoPL')
  addRow('Outros Recursos PL', 'outrosRecursosPL', 'totalPassivoPL')

  addTotalRow('PASSIVO + PL TOTAL', 'totalPassivoPL')

  table += '</table>'

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Balanco_Patrimonial</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
    </head>
    <body>${table}</body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Balanco_Patrimonial_${companyName ? companyName.replace(/[^a-z0-9]/gi, '_') : 'Export'}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
