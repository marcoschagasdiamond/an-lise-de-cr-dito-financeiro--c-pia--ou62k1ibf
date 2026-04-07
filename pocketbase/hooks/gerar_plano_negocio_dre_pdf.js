routerAdd(
  'POST',
  '/backend/v1/gerar-pdf-plano',
  (e) => {
    const body = e.requestInfo().body || {}
    const plano = body.plano || {}
    const dre = body.dre || []
    const cenarios = body.cenarios || {}

    const tableDre = dre
      .map(
        (d) => `
      <tr class="border-b border-gray-100 text-sm">
        <td class="py-2 px-2 font-medium">Ano ${d.ano}</td>
        <td class="py-2 px-2 text-right">R$ ${(d.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="py-2 px-2 text-right text-red-600">-R$ ${(d.custos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="py-2 px-2 text-right font-semibold">R$ ${(d.resultadoOperacional || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="py-2 px-2 text-right text-red-600">-R$ ${(d.despesasFinanceiras || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="py-2 px-2 text-right font-bold text-[#002147]">R$ ${(d.resultadoLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="py-2 px-2 text-right text-[#C5A059]">-R$ ${(d.distribuicaoLucros || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      </tr>
    `,
      )
      .join('')

    let estruturaHtml = ''
    if (cenarios.emprestimo?.ativo)
      estruturaHtml += `<li class="mb-2"><strong>Empréstimo (${cenarios.emprestimo.dados.banco}):</strong> R$ ${(cenarios.emprestimo.dados.valor || 0).toLocaleString('pt-BR')} | Taxa: ${cenarios.emprestimo.dados.taxa_juros}% a.a. | Prazo: ${cenarios.emprestimo.dados.prazo} meses</li>`
    if (cenarios.investidor?.ativo)
      estruturaHtml += `<li class="mb-2"><strong>Investidor (${cenarios.investidor.dados.nome_investidor}):</strong> R$ ${(cenarios.investidor.dados.valor_aporte || 0).toLocaleString('pt-BR')} | Part.: ${cenarios.investidor.dados.participacao_acionaria}%</li>`
    if (cenarios.cotas?.ativo)
      estruturaHtml += `<li class="mb-2"><strong>Cotas (${cenarios.cotas.dados.tipo_cota}):</strong> ${cenarios.cotas.dados.quantidade} cotas de R$ ${(cenarios.cotas.dados.valor_cota || 0).toLocaleString('pt-BR')} | Retorno: ${cenarios.cotas.dados.retorno_esperado}% a.a.</li>`

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Plano de Negócios - ${plano.nome_projeto || 'Projeto'}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        @media print {
          .page-break { page-break-before: always; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none; }
        }
        body { font-family: 'Inter', sans-serif; background-color: #f9fafb; }
        .document-container { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        @media print { .document-container { box-shadow: none; max-width: 100%; } }
      </style>
    </head>
    <body class="text-gray-800 antialiased p-0 sm:p-8">
      
      <div class="no-print fixed top-4 right-4 z-50">
        <button onclick="window.print()" class="bg-[#C5A059] hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded shadow-lg">
          Imprimir / Salvar PDF
        </button>
      </div>

      <div class="document-container min-h-screen relative pb-16">
        <!-- Capa -->
        <div class="h-[1050px] flex flex-col items-center justify-center bg-[#002147] text-white text-center p-12 relative overflow-hidden">
          <div class="z-10 w-full max-w-2xl">
            <h1 class="text-6xl font-bold text-[#C5A059] mb-6 tracking-tight">DIAMOND GROUP</h1>
            <div class="h-1 w-32 bg-[#C5A059] mx-auto mb-8"></div>
            <h2 class="text-4xl font-light mb-6">Plano de Negócios e DRE Projetado</h2>
            <p class="text-2xl font-semibold opacity-90">${plano.nome_projeto || 'Projeto Estruturado'}</p>
            <p class="absolute bottom-12 left-0 right-0 text-gray-400 font-mono text-sm">GERADO EM ${new Date().toLocaleDateString('pt-BR')} • CONFIDENCIAL</p>
          </div>
        </div>

        <div class="page-break"></div>

        <div class="p-12 space-y-12">
          <!-- Seções Descritivas -->
          <section>
            <h2 class="text-2xl font-bold text-[#002147] mb-2">Apresentação da Empresa</h2>
            <div class="h-1 w-16 bg-[#C5A059] mb-4"></div>
            <div class="text-gray-600 text-justify leading-relaxed whitespace-pre-wrap">${plano.apresentacao_empresa || 'Não preenchido.'}</div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-[#002147] mb-2">Apresentação do Projeto</h2>
            <div class="h-1 w-16 bg-[#C5A059] mb-4"></div>
            <div class="text-gray-600 text-justify leading-relaxed whitespace-pre-wrap">${plano.apresentacao_projeto || 'Não preenchido.'}</div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-[#002147] mb-2">Mercado e Justificativa</h2>
            <div class="h-1 w-16 bg-[#C5A059] mb-4"></div>
            <div class="text-gray-600 text-justify leading-relaxed whitespace-pre-wrap">${plano.mercado_justificativa || 'Não preenchido.'}</div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-[#002147] mb-2">Estrutura de Investimentos</h2>
            <div class="h-1 w-16 bg-[#C5A059] mb-4"></div>
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <ul class="text-gray-700 space-y-2">
                ${estruturaHtml || '<li>Nenhuma fonte de financiamento ativa selecionada.</li>'}
              </ul>
            </div>
          </section>
        </div>

        <div class="page-break"></div>

        <!-- DRE -->
        <div class="p-12">
          <section>
            <h2 class="text-2xl font-bold text-[#002147] mb-2">DRE Projetado (10 Anos)</h2>
            <div class="h-1 w-16 bg-[#C5A059] mb-6"></div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-[#002147] text-white text-sm">
                    <th class="py-2 px-2 rounded-tl">Período</th>
                    <th class="py-2 px-2 text-right">Receita</th>
                    <th class="py-2 px-2 text-right">Custos</th>
                    <th class="py-2 px-2 text-right">Res. Oper.</th>
                    <th class="py-2 px-2 text-right">Desp. Fin.</th>
                    <th class="py-2 px-2 text-right">Res. Líquido</th>
                    <th class="py-2 px-2 text-right rounded-tr">Distr. Lucros</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableDre}
                </tbody>
              </table>
            </div>
          </section>

          <section class="mt-16 pt-8 border-t-2 border-gray-100">
            <h2 class="text-xl font-bold text-[#002147] mb-4">Conclusão Final</h2>
            <p class="text-gray-600 text-justify">
              O presente plano demonstra as premissas projetadas e os resultados esperados com base nos cenários de capital selecionados. A estruturação apresentada no DRE de 10 anos reflete a capacidade operacional e financeira da iniciativa.
            </p>
          </section>
        </div>
      </div>
      <script>
        window.onload = () => { setTimeout(() => window.print(), 500); }
      </script>
    </body>
    </html>
    `

    return e.json(200, { html: html })
  },
  $apis.requireAuth(),
)
