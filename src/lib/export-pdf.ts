import { formatCurrency, formatPercent } from './calculators'

export function generateProjectPDF(plano: any, cenarios: any, dreProjetado: any[], metricas: any) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Por favor, permita pop-ups para gerar o PDF.')
    return
  }

  const logoUrl = 'https://img.usecurling.com/i?q=diamond&shape=fill&color=gold'

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Plano de Negócios - ${plano.nome_projeto || 'Projeto'}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          color: #334155;
          line-height: 1.5;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        .page {
          background: white;
          padding: 40px 50px;
          margin: 0 auto 20px;
          max-width: 1000px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        @media print {
          body { background-color: white; }
          .page { box-shadow: none; margin: 0; padding: 20px; max-width: 100%; page-break-after: always; }
          .no-print { display: none; }
        }
        .text-primary { color: #002147; }
        .text-gold { color: #C5A059; }
        .bg-primary { background-color: #002147; color: white; }
        .bg-gold { background-color: #C5A059; color: white; }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #C5A059;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header img { height: 60px; }
        h1 { font-size: 28px; margin: 0 0 10px; color: #002147; }
        h2 { font-size: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; color: #002147; }
        h3 { font-size: 16px; color: #475569; margin-bottom: 5px; }
        p { margin-top: 0; margin-bottom: 15px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .card { background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #002147; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
        th, td { padding: 8px; border: 1px solid #cbd5e1; text-align: left; }
        th { background-color: #002147; color: white; font-weight: 600; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .positive { color: #10b981; font-weight: bold; }
        .negative { color: #ef4444; font-weight: bold; }
        .badge { padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
        .badge-positive { background: #d1fae5; color: #047857; }
        .badge-negative { background: #fee2e2; color: #b91c1c; }
        .cover { height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .cover h1 { font-size: 48px; color: #002147; margin-bottom: 20px; }
        .cover p { font-size: 20px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="cover">
          <img src="${logoUrl}" alt="Diamond Group" style="height: 100px; margin-bottom: 40px;">
          <h1>Plano de Negócios e Viabilidade</h1>
          <p>${plano.nome_projeto || 'Análise de Projeto Financeiro'}</p>
          <div style="margin-top: 60px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; width: 60%;">
            <h3>Elaborado por</h3>
            <p class="text-primary" style="font-size: 18px; font-weight: bold;">Diamond Group</p>
            <p>${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div class="page">
        <div class="header">
          <div>
            <h1>${plano.nome_projeto || 'Análise de Projeto'}</h1>
            <p>Dados Qualitativos e Estrutura</p>
          </div>
          <img src="${logoUrl}" alt="Logo">
        </div>

        <h2>Apresentação da Empresa</h2>
        <div class="card"><p>${plano.apresentacao_empresa || 'Não informado.'}</p></div>

        <h2>Apresentação do Projeto</h2>
        <div class="card"><p>${plano.apresentacao_projeto || 'Não informado.'}</p></div>

        <h2>Mercado e Justificativa</h2>
        <div class="card"><p>${plano.mercado_justificativa || 'Não informado.'}</p></div>

        <h2>Estrutura de Investimento</h2>
        <div class="grid-3">
          <div class="card" style="border-left-color: ${cenarios.emprestimo.ativo ? '#10b981' : '#cbd5e1'};">
            <h3>Empréstimo ${cenarios.emprestimo.ativo ? '(Ativo)' : '(Inativo)'}</h3>
            <p><strong>Banco:</strong> ${cenarios.emprestimo.dados.banco || '-'}</p>
            <p><strong>Valor:</strong> ${formatCurrency(cenarios.emprestimo.dados.valor || 0)}</p>
            <p><strong>Taxa/Prazo:</strong> ${cenarios.emprestimo.dados.taxa_juros || 0}% a.a / ${cenarios.emprestimo.dados.prazo || 0}m</p>
          </div>
          <div class="card" style="border-left-color: ${cenarios.investidor.ativo ? '#10b981' : '#cbd5e1'};">
            <h3>Investidor ${cenarios.investidor.ativo ? '(Ativo)' : '(Inativo)'}</h3>
            <p><strong>Nome:</strong> ${cenarios.investidor.dados.nome_investidor || '-'}</p>
            <p><strong>Aporte:</strong> ${formatCurrency(cenarios.investidor.dados.valor_aporte || 0)}</p>
            <p><strong>Participação:</strong> ${cenarios.investidor.dados.participacao_acionaria || 0}%</p>
          </div>
          <div class="card" style="border-left-color: ${cenarios.cotas.ativo ? '#10b981' : '#cbd5e1'};">
            <h3>Cotas ${cenarios.cotas.ativo ? '(Ativo)' : '(Inativo)'}</h3>
            <p><strong>Tipo:</strong> ${cenarios.cotas.dados.tipo_cota || '-'}</p>
            <p><strong>Valor/Qtd:</strong> ${formatCurrency(cenarios.cotas.dados.valor_cota || 0)} x ${cenarios.cotas.dados.quantidade || 0}</p>
            <p><strong>Retorno:</strong> ${cenarios.cotas.dados.retorno_esperado || 0}% a.a.</p>
          </div>
        </div>
      </div>

      <div class="page">
        <div class="header">
          <div>
            <h1>Projeções Financeiras</h1>
            <p>DRE Projetada - 10 Anos</p>
          </div>
          <img src="${logoUrl}" alt="Logo">
        </div>

        <table>
          <thead>
            <tr>
              <th>Estrutura</th>
              ${dreProjetado.map((d) => `<th class="text-right">Ano ${d.ano}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Receita Bruta</td>
              ${dreProjetado.map((d) => `<td class="text-right">${formatCurrency(d.receitaBruta)}</td>`).join('')}
            </tr>
            <tr>
              <td>(-) Deduções</td>
              ${dreProjetado.map((d) => `<td class="text-right text-red-600">-${formatCurrency(d.deducoes)}</td>`).join('')}
            </tr>
            <tr style="background-color: #f1f5f9; font-weight: bold;">
              <td>= Receita Líquida</td>
              ${dreProjetado.map((d) => `<td class="text-right">${formatCurrency(d.receitaLiquida)}</td>`).join('')}
            </tr>
            <tr>
              <td>(-) Custos</td>
              ${dreProjetado.map((d) => `<td class="text-right text-red-600">-${formatCurrency(d.custosVendas)}</td>`).join('')}
            </tr>
            <tr>
              <td>(-) Despesas Oper.</td>
              ${dreProjetado.map((d) => `<td class="text-right text-red-600">-${formatCurrency(d.despesasOperacionais)}</td>`).join('')}
            </tr>
            <tr style="background-color: #e2e8f0; font-weight: bold;">
              <td>= EBITDA</td>
              ${dreProjetado.map((d) => `<td class="text-right text-primary">${formatCurrency(d.ebitda)}</td>`).join('')}
            </tr>
            <tr>
              <td>Margem EBITDA</td>
              ${dreProjetado.map((d) => `<td class="text-right">${d.ebitdaMargin.toFixed(1)}%</td>`).join('')}
            </tr>
            <tr>
              <td>(-) Desp. Financeiras</td>
              ${dreProjetado.map((d) => `<td class="text-right text-red-600">-${formatCurrency(d.despesasFinanceiras)}</td>`).join('')}
            </tr>
            <tr>
              <td>(-) Impostos (IR/CSLL)</td>
              ${dreProjetado.map((d) => `<td class="text-right text-red-600">-${formatCurrency(d.irCsll)}</td>`).join('')}
            </tr>
            <tr style="background-color: #002147; color: white; font-weight: bold;">
              <td style="color: white;">= Resultado Líquido</td>
              ${dreProjetado.map((d) => `<td class="text-right" style="color: white;">${formatCurrency(d.resultadoLiquido)}</td>`).join('')}
            </tr>
            <tr style="background-color: #f8fafc;">
              <td>Lucratividade</td>
              ${dreProjetado.map((d) => `<td class="text-right">${d.lucratividade.toFixed(1)}%</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="page">
        <div class="header">
          <div>
            <h1>Análise de Viabilidade</h1>
            <p>Métricas e Sensibilidade</p>
          </div>
          <img src="${logoUrl}" alt="Logo">
        </div>

        <div class="grid-2">
          <div>
            <h2>Métricas de Desempenho</h2>
            <table>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th class="text-right">Valor Calculado</th>
                  <th class="text-center">Interpretação</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>EBITDA (Média)</td>
                  <td class="text-right"><strong>${formatCurrency(metricas.ebitdaMedio)}</strong></td>
                  <td class="text-center"><span class="badge ${metricas.ebitdaMedio > 0 ? 'badge-positive' : 'badge-negative'}">${metricas.ebitdaMedio > 0 ? 'Positivo' : 'Alerta'}</span></td>
                </tr>
                <tr>
                  <td>Margem EBITDA (Média)</td>
                  <td class="text-right"><strong>${formatPercent(metricas.margemMedia / 100)}</strong></td>
                  <td class="text-center"><span class="badge ${metricas.margemMedia > 15 ? 'badge-positive' : 'badge-negative'}">${metricas.margemMedia > 15 ? 'Positivo' : 'Alerta'}</span></td>
                </tr>
                <tr>
                  <td>Lucratividade (Média)</td>
                  <td class="text-right"><strong>${formatPercent(metricas.lucratividadeMedia / 100)}</strong></td>
                  <td class="text-center"><span class="badge ${metricas.lucratividadeMedia > 10 ? 'badge-positive' : 'badge-negative'}">${metricas.lucratividadeMedia > 10 ? 'Positivo' : 'Alerta'}</span></td>
                </tr>
                <tr>
                  <td>TIR (Líquida)</td>
                  <td class="text-right"><strong>${formatPercent(metricas.tir / 100)}</strong></td>
                  <td class="text-center"><span class="badge ${metricas.tir > 10 ? 'badge-positive' : 'badge-negative'}">${metricas.tir > 10 ? 'Positivo' : 'Alerta'}</span></td>
                </tr>
                <tr>
                  <td>TIR EBTD</td>
                  <td class="text-right"><strong>${formatPercent(metricas.tirEBTD / 100)}</strong></td>
                  <td class="text-center"><span class="badge ${metricas.tirEBTD > 10 ? 'badge-positive' : 'badge-negative'}">${metricas.tirEBTD > 10 ? 'Positivo' : 'Alerta'}</span></td>
                </tr>
                <tr>
                  <td>TIR EBITDA</td>
                  <td class="text-right"><strong>${formatPercent(metricas.tirEBITDA / 100)}</strong></td>
                  <td class="text-center"><span class="badge ${metricas.tirEBITDA > 10 ? 'badge-positive' : 'badge-negative'}">${metricas.tirEBITDA > 10 ? 'Positivo' : 'Alerta'}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2>VPL por Taxa de Desconto</h2>
            <table>
              <thead>
                <tr>
                  <th>Taxa</th>
                  <th class="text-right">VPL 5 Anos</th>
                  <th class="text-right">VPL 10 Anos</th>
                </tr>
              </thead>
              <tbody>
                ${metricas.vpl10
                  .map((vpl10: any, idx: number) => {
                    const vpl5 = metricas.vpl5[idx]
                    return `
                    <tr>
                      <td>${formatPercent(vpl10.rate)}</td>
                      <td class="text-right ${vpl5.value >= 0 ? 'positive' : 'negative'}">${formatCurrency(vpl5.value)}</td>
                      <td class="text-right ${vpl10.value >= 0 ? 'positive' : 'negative'}">${formatCurrency(vpl10.value)}</td>
                    </tr>
                  `
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>

        <h2>Conclusão da Análise</h2>
        <div class="card" style="border-left-color: ${metricas.tir > 10 && metricas.ebitdaMedio > 0 ? '#10b981' : '#ef4444'};">
          <p>
            Com base nas projeções financeiras, o projeto apresenta uma Taxa Interna de Retorno (TIR) de <strong>${formatPercent(metricas.tir / 100)}</strong> 
            e uma margem EBITDA média de <strong>${formatPercent(metricas.margemMedia / 100)}</strong>. 
            O Valor Presente Líquido (VPL) em 10 anos a uma taxa de 10% é <strong>${formatCurrency(metricas.vpl10.find((v: any) => v.rate === 0.1)?.value || 0)}</strong>.
          </p>
          <p style="font-weight: bold; color: ${metricas.tir > 10 && metricas.ebitdaMedio > 0 ? '#047857' : '#b91c1c'}; margin-top: 10px;">
            ${
              metricas.tir > 10 && metricas.ebitdaMedio > 0
                ? '✅ O cenário projetado indica viabilidade financeira positiva para o projeto estruturado.'
                : '⚠️ O cenário projetado requer atenção. Algumas métricas indicam riscos na viabilidade financeira sob a atual estrutura.'
            }
          </p>
        </div>

        <div style="text-align: center; margin-top: 60px;">
          <button class="no-print" onclick="window.print()" style="background: #002147; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold;">
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait briefly for resources to load if any, then prompt print directly
  setTimeout(() => {
    printWindow.focus()
  }, 250)
}
