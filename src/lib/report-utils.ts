import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'

export const generateProjectReportPDF = async (projetoId: string) => {
  try {
    const projeto = await pb.collection('projetos').getOne(projetoId, { expand: 'cliente_id' })
    const cliente = projeto.expand?.cliente_id

    const fases = await pb
      .collection('fases_projeto')
      .getFullList({ filter: `projeto_id = "${projetoId}"`, sort: 'numero_fase' })
    const tarefas = await pb
      .collection('tarefas_fase')
      .getFullList({ filter: `fase_id.projeto_id = "${projetoId}"`, expand: 'fase_id' })
    const pendencias = await pb
      .collection('pendencias')
      .getFullList({ filter: `projeto_id = "${projetoId}"` })
    const documentos = await pb
      .collection('documentos_projeto')
      .getFullList({ filter: `projeto_id = "${projetoId}"` })
    const envios = await pb
      .collection('envios_instituicoes')
      .getFullList({ filter: `projeto_id = "${projetoId}"`, expand: 'instituicao_id' })

    const tarefasConcluidas = tarefas.filter((t) => t.status === 'concluida').length
    const tarefasPendentes = tarefas.length - tarefasConcluidas

    let simulacoes: any[] = []
    if (cliente?.user_id) {
      try {
        simulacoes = await pb
          .collection('simulacoes_financeiras')
          .getFullList({ filter: `user_id = "${cliente.user_id}"` })
      } catch (e) {
        console.warn('Could not fetch simulations:', e)
      }
    }

    const html = `
      <html>
        <head>
          <title>Relatório de Projeto - ${cliente?.nome || 'N/A'}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 40px; max-width: 900px; margin: 0 auto; }
            h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 30px; font-size: 24px; }
            h2 { color: #334155; margin-top: 40px; font-size: 18px; border-left: 4px solid #3b82f6; padding-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; font-size: 14px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 12px; }
            .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .summary-box { background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .summary-box strong { display: block; font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
            .summary-box span { font-size: 18px; font-weight: 700; color: #0f172a; }
            .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
            .badge-concluida { background-color: #dcfce7; color: #166534; }
            .badge-pendente { background-color: #fef9c3; color: #854d0e; }
            .badge-neutral { background-color: #f1f5f9; color: #475569; }
            .header-info { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
            .date-generated { font-size: 12px; color: #64748b; }
            @media print {
              body { padding: 0; max-width: 100%; }
              button { display: none; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header-info">
            <h1>Relatório Executivo de Projeto</h1>
            <div class="date-generated">Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
          </div>
          
          <div class="summary">
            <div class="summary-box">
              <strong>Cliente / Empresa</strong>
              <span>${cliente?.nome || '-'}</span>
            </div>
            <div class="summary-box">
              <strong>CNPJ / Razão Social</strong>
              <span style="font-size: 14px;">${cliente?.cnpj || '-'}</span><br/>
              <span style="font-size: 14px; font-weight: normal;">${cliente?.razao_social || '-'}</span>
            </div>
            <div class="summary-box">
              <strong>Valor da Operação</strong>
              <span>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projeto.valor_operacao || 0)}</span>
            </div>
            <div class="summary-box">
              <strong>Fase Atual</strong>
              <span>Fase ${projeto.fase_atual || 1}</span>
            </div>
          </div>

          <h2>1. Cronograma de Fases</h2>
          <table>
            <thead>
              <tr><th>Fase</th><th>Nome da Fase</th><th>Status</th><th>Início</th><th>Conclusão</th></tr>
            </thead>
            <tbody>
              ${fases
                .map(
                  (f) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${f.numero_fase}</td>
                  <td>${f.nome_fase}</td>
                  <td><span class="badge ${f.status === 'concluida' ? 'badge-concluida' : 'badge-neutral'}">${f.status.replace('_', ' ').toUpperCase()}</span></td>
                  <td>${f.data_inicio ? format(new Date(f.data_inicio), 'dd/MM/yyyy') : '-'}</td>
                  <td>${f.data_conclusao ? format(new Date(f.data_conclusao), 'dd/MM/yyyy') : '-'}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <h2>2. Resumo de Tarefas</h2>
          <div class="summary">
            <div class="summary-box">
              <strong>Total de Tarefas</strong>
              <span>${tarefas.length}</span>
            </div>
            <div class="summary-box">
              <strong>Concluídas</strong>
              <span style="color: #16a34a;">${tarefasConcluidas}</span>
            </div>
            <div class="summary-box">
              <strong>Pendentes</strong>
              <span style="color: #ca8a04;">${tarefasPendentes}</span>
            </div>
          </div>

          <h2>3. Pendências (Issues)</h2>
          <table>
            <thead>
              <tr><th>Tipo</th><th>Descrição</th><th>Status</th><th>Resolução</th></tr>
            </thead>
            <tbody>
              ${
                pendencias.length > 0
                  ? pendencias
                      .map(
                        (p) => `
                <tr>
                  <td><span class="badge badge-neutral">${p.tipo.toUpperCase()}</span></td>
                  <td>${p.descricao}</td>
                  <td>${p.status.replace('_', ' ')}</td>
                  <td>${p.data_resolucao ? format(new Date(p.data_resolucao), 'dd/MM/yyyy') : '-'}</td>
                </tr>
              `,
                      )
                      .join('')
                  : '<tr><td colspan="4" style="text-align:center; color: #64748b;">Nenhuma pendência registrada</td></tr>'
              }
            </tbody>
          </table>

          <h2>4. Documentação do Projeto</h2>
          <table>
            <thead>
              <tr><th>Documento</th><th>Tipo</th><th>Versão</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${
                documentos.length > 0
                  ? documentos
                      .map(
                        (d) => `
                <tr>
                  <td>${d.nome}</td>
                  <td>${d.tipo}</td>
                  <td>v${d.versao}</td>
                  <td>${d.status.replace('_', ' ')}</td>
                </tr>
              `,
                      )
                      .join('')
                  : '<tr><td colspan="4" style="text-align:center; color: #64748b;">Nenhum documento registrado</td></tr>'
              }
            </tbody>
          </table>

          <h2>5. Histórico de Envios (Instituições Financeiras)</h2>
          <table>
            <thead>
              <tr><th>Instituição</th><th>Data Envio</th><th>Status</th><th>Observações</th></tr>
            </thead>
            <tbody>
              ${
                envios.length > 0
                  ? envios
                      .map(
                        (e) => `
                <tr>
                  <td style="font-weight: 500;">${e.expand?.instituicao_id?.nome || 'Desconhecida'}</td>
                  <td>${e.data_envio ? format(new Date(e.data_envio), 'dd/MM/yyyy') : '-'}</td>
                  <td><span class="badge ${e.status === 'aprovado' ? 'badge-concluida' : 'badge-neutral'}">${e.status.replace('_', ' ').toUpperCase()}</span></td>
                  <td>${e.observacoes || '-'}</td>
                </tr>
              `,
                      )
                      .join('')
                  : '<tr><td colspan="4" style="text-align:center; color: #64748b;">Nenhum envio registrado</td></tr>'
              }
            </tbody>
          </table>

          <h2>6. Resumo Financeiro (Simulações)</h2>
          <table>
            <thead>
              <tr><th>Modalidade</th><th>Valor Solicitado</th><th>Taxa (%)</th><th>Prazo (meses)</th></tr>
            </thead>
            <tbody>
              ${
                simulacoes.length > 0
                  ? simulacoes
                      .map(
                        (s) => `
                <tr>
                  <td style="text-transform: capitalize;">${s.modality}</td>
                  <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(s.loan_value)}</td>
                  <td>${s.interest_rate}% a.m.</td>
                  <td>${s.term}</td>
                </tr>
              `,
                      )
                      .join('')
                  : '<tr><td colspan="4" style="text-align:center; color: #64748b;">Nenhuma simulação financeira vinculada</td></tr>'
              }
            </tbody>
          </table>

          <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <button onclick="window.print()" style="padding: 12px 24px; background-color: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500; transition: background-color 0.2s;">
              Imprimir / Salvar PDF
            </button>
          </div>
          
          <script>
            setTimeout(() => { window.print(); }, 500);
          </script>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    } else {
      alert('Por favor, permita pop-ups no seu navegador para gerar o relatório.')
    }
  } catch (error) {
    console.error('Error generating report:', error)
    alert('Erro ao gerar relatório. Verifique sua conexão e tente novamente.')
  }
}
