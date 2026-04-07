routerAdd(
  'POST',
  '/backend/v1/gerar-ppt-plano',
  (e) => {
    const body = e.requestInfo().body || {}
    const plano = body.plano || {}
    const dre = body.dre || []
    const cenarios = body.cenarios || {}

    let estruturaHtml = ''
    if (cenarios.emprestimo?.ativo)
      estruturaHtml += `<li class="mb-4 text-xl"><strong>Empréstimo (${cenarios.emprestimo.dados.banco}):</strong> R$ ${(cenarios.emprestimo.dados.valor || 0).toLocaleString('pt-BR')} | Taxa: ${cenarios.emprestimo.dados.taxa_juros}% a.a.</li>`
    if (cenarios.investidor?.ativo)
      estruturaHtml += `<li class="mb-4 text-xl"><strong>Investidor (${cenarios.investidor.dados.nome_investidor}):</strong> R$ ${(cenarios.investidor.dados.valor_aporte || 0).toLocaleString('pt-BR')} | Part.: ${cenarios.investidor.dados.participacao_acionaria}%</li>`
    if (cenarios.cotas?.ativo)
      estruturaHtml += `<li class="mb-4 text-xl"><strong>Cotas (${cenarios.cotas.dados.tipo_cota}):</strong> ${cenarios.cotas.dados.quantidade} cotas de R$ ${(cenarios.cotas.dados.valor_cota || 0).toLocaleString('pt-BR')}</li>`

    const dreSlides = []
    // Group DRE in chunks of 5 years per slide
    for (let i = 0; i < dre.length; i += 5) {
      const chunk = dre.slice(i, i + 5)
      const rows = chunk
        .map(
          (d) => `
        <tr class="border-b border-gray-200">
          <td class="py-3 px-4 font-bold text-[#002147]">Ano ${d.ano}</td>
          <td class="py-3 px-4 text-right">R$ ${(d.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>
          <td class="py-3 px-4 text-right text-red-600">-R$ ${(d.custos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>
          <td class="py-3 px-4 text-right font-bold text-[#002147]">R$ ${(d.resultadoLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>
        </tr>
      `,
        )
        .join('')

      dreSlides.push(`
        <div class="slide">
          <div class="header">
            <h2>DRE Projetado (Anos ${chunk[0].ano} a ${chunk[chunk.length - 1].ano})</h2>
          </div>
          <div class="content flex items-center justify-center h-full">
            <table class="w-full text-lg border-collapse bg-white rounded-xl shadow overflow-hidden">
              <thead class="bg-[#002147] text-white">
                <tr>
                  <th class="py-4 px-4 text-left">Período</th>
                  <th class="py-4 px-4 text-right">Receita Bruta</th>
                  <th class="py-4 px-4 text-right">Custos Totais</th>
                  <th class="py-4 px-4 text-right">Resultado Líquido</th>
                </tr>
              </thead>
              <tbody class="text-gray-700">
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `)
    }

    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Apresentação - ${plano.nome_projeto || 'Projeto'}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        body { 
          margin: 0; padding: 0; 
          font-family: 'Montserrat', sans-serif; 
          background: #111; 
          overflow-x: hidden;
          scroll-snap-type: y mandatory;
        }
        .slide {
          width: 1024px; height: 576px; /* 16:9 ratio */
          background: #f8fafc;
          margin: 20px auto;
          position: relative;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .header {
          background: #002147;
          color: white;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 4px solid #C5A059;
        }
        .header h2 { margin: 0; font-size: 28px; font-weight: 600; }
        .content {
          padding: 40px;
          flex: 1;
          color: #334155;
          font-size: 22px;
          line-height: 1.6;
        }
        
        @media print {
          body { background: white; margin: 0; }
          .slide { 
            width: 100vw; height: 100vh; 
            margin: 0; box-shadow: none; 
            page-break-after: always; 
            page-break-inside: avoid;
          }
          @page { size: 16in 9in landscape; margin: 0; }
          .no-print { display: none; }
        }

        .cover-slide {
          background: linear-gradient(135deg, #002147 0%, #00122e 100%);
          color: white;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .cover-slide h1 { font-size: 64px; color: #C5A059; margin-bottom: 20px; font-weight: 700; }
        .cover-slide h2 { font-size: 36px; font-weight: 300; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      
      <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 100;">
        <button onclick="window.print()" style="background: #C5A059; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
          Salvar como PDF (Paisagem)
        </button>
      </div>

      <!-- Capa -->
      <div class="slide cover-slide">
        <h1>DIAMOND GROUP</h1>
        <div style="width: 100px; height: 4px; background: #C5A059; margin: 0 auto 30px;"></div>
        <h2>Apresentação de Projeto</h2>
        <p style="font-size: 28px; opacity: 0.9; margin-top: 20px;">${plano.nome_projeto || 'Plano de Negócios'}</p>
      </div>

      <!-- Empresa -->
      <div class="slide">
        <div class="header">
          <h2>Nossa Empresa</h2>
        </div>
        <div class="content" style="display: flex; flex-direction: column; justify-content: center;">
          <p>${plano.apresentacao_empresa || 'Informações da empresa não cadastradas.'}</p>
        </div>
      </div>

      <!-- Projeto -->
      <div class="slide">
        <div class="header">
          <h2>O Projeto</h2>
        </div>
        <div class="content" style="display: flex; flex-direction: column; justify-content: center;">
          <p>${plano.apresentacao_projeto || 'Informações do projeto não cadastradas.'}</p>
        </div>
      </div>

      <!-- Mercado -->
      <div class="slide">
        <div class="header">
          <h2>Mercado e Justificativa</h2>
        </div>
        <div class="content" style="display: flex; flex-direction: column; justify-content: center;">
          <p>${plano.mercado_justificativa || 'Informações de mercado não cadastradas.'}</p>
        </div>
      </div>

      <!-- Investimentos -->
      <div class="slide">
        <div class="header">
          <h2>Estrutura de Investimentos</h2>
        </div>
        <div class="content" style="display: flex; flex-direction: column; justify-content: center;">
          <ul style="list-style-type: none; padding: 0;">
            ${estruturaHtml || '<li>Nenhum cenário ativo configurado.</li>'}
          </ul>
        </div>
      </div>

      <!-- DRE Slides -->
      ${dreSlides.join('')}

      <!-- Encerramento -->
      <div class="slide cover-slide" style="background: #002147;">
        <h1 style="color: white; font-size: 48px;">Obrigado</h1>
        <div style="width: 80px; height: 3px; background: #C5A059; margin: 20px auto;"></div>
        <h2 style="color: #C5A059; font-size: 24px;">DIAMOND GROUP</h2>
      </div>

    </body>
    </html>
    `

    return e.json(200, { html: html })
  },
  $apis.requireAuth(),
)
