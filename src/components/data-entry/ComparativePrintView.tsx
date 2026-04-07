import React from 'react'
import { useFinancialStore } from '@/store/main'
import { formatCurrency } from '@/lib/calculators'

interface Props {
  scenarioIds: string[]
}

export function ComparativePrintView({ scenarioIds }: Props) {
  const { scenarios, companyDetails } = useFinancialStore()

  const selectedScenarios = scenarios.filter((s) => scenarioIds.includes(s.id))

  if (selectedScenarios.length === 0) return null

  // Helper to extract 2023 data
  const getScenarioData = (sc: any) => {
    const bp = sc.balanceSheets.find((b: any) => b.year === 2023) || {}
    const dre = sc.dre?.find((d: any) => d.year === 2023) || {}

    const ativoTotal = (bp.ativoCirculante || 0) + (bp.ativoNaoCirculante || 0)
    const passivoTotal = (bp.passivoCirculante || 0) + (bp.passivoNaoCirculante || 0)
    const pl = bp.patrimonioLiquido || 0
    const receita = dre.receita || 0
    const custos = (dre.cpv || 0) + (dre.despesasOperacionais || 0)
    const ebitda = receita - custos + (dre.depreciacao || 0)

    const ac = bp.ativoCirculante || 0
    const pc = bp.passivoCirculante || 0
    const estoques = bp.estoques || 0
    const liqCorrente = pc > 0 ? ac / pc : 0
    const liqSeca = pc > 0 ? (ac - estoques) / pc : 0

    return { ativoTotal, passivoTotal, pl, receita, custos, ebitda, liqCorrente, liqSeca }
  }

  return (
    <div className="w-full bg-white text-slate-900 font-sans print:p-0">
      <div className="mb-6 border-b-2 border-slate-800 pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
          Relatório Comparativo de Cenários
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm mt-4 text-slate-800">
          <div>
            <strong>Empresa:</strong> {companyDetails.razaoSocial || 'N/A'}
          </div>
          <div>
            <strong>CNPJ:</strong> {companyDetails.cnpj || 'N/A'}
          </div>
          <div>
            <strong>Setor:</strong> {companyDetails.setor || 'N/A'}
          </div>
          <div>
            <strong>Data de Geração:</strong> {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      <table className="w-full border-collapse border border-slate-400 text-sm mb-8">
        <thead>
          <tr className="bg-slate-200">
            <th className="border border-slate-400 p-2 text-left w-[40%] font-bold text-slate-900">
              Indicador / Conta (Base 2023)
            </th>
            {selectedScenarios.map((sc) => (
              <th
                key={sc.id}
                className="border border-slate-400 p-2 text-center w-[30%] font-bold text-slate-900"
              >
                {sc.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className="border border-slate-400 p-2 font-bold bg-slate-100 uppercase text-xs text-slate-800 tracking-wider"
              colSpan={selectedScenarios.length + 1}
            >
              Balanço Patrimonial
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 p-2 pl-4 text-slate-800">Ativo Total</td>
            {selectedScenarios.map((sc) => (
              <td key={sc.id} className="border border-slate-400 p-2 text-right">
                {formatCurrency(getScenarioData(sc).ativoTotal)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-slate-400 p-2 pl-4 text-slate-800">
              Passivo Exigível Total
            </td>
            {selectedScenarios.map((sc) => (
              <td key={sc.id} className="border border-slate-400 p-2 text-right">
                {formatCurrency(getScenarioData(sc).passivoTotal)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-slate-400 p-2 pl-4 font-bold text-slate-900">
              Patrimônio Líquido
            </td>
            {selectedScenarios.map((sc) => (
              <td
                key={sc.id}
                className="border border-slate-400 p-2 text-right font-bold text-slate-900"
              >
                {formatCurrency(getScenarioData(sc).pl)}
              </td>
            ))}
          </tr>

          <tr>
            <td
              className="border border-slate-400 p-2 font-bold bg-slate-100 uppercase text-xs text-slate-800 tracking-wider"
              colSpan={selectedScenarios.length + 1}
            >
              Demonstrativo de Resultados
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 p-2 pl-4 text-slate-800">Receita Bruta</td>
            {selectedScenarios.map((sc) => (
              <td key={sc.id} className="border border-slate-400 p-2 text-right">
                {formatCurrency(getScenarioData(sc).receita)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-slate-400 p-2 pl-4 text-slate-800">Custos e Despesas</td>
            {selectedScenarios.map((sc) => (
              <td key={sc.id} className="border border-slate-400 p-2 text-right">
                {formatCurrency(getScenarioData(sc).custos)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-slate-400 p-2 pl-4 font-bold text-slate-900">EBITDA</td>
            {selectedScenarios.map((sc) => (
              <td
                key={sc.id}
                className="border border-slate-400 p-2 text-right font-bold text-slate-900"
              >
                {formatCurrency(getScenarioData(sc).ebitda)}
              </td>
            ))}
          </tr>

          <tr>
            <td
              className="border border-slate-400 p-2 font-bold bg-slate-100 uppercase text-xs text-slate-800 tracking-wider"
              colSpan={selectedScenarios.length + 1}
            >
              Indicadores de Liquidez
            </td>
          </tr>
          <tr>
            <td className="border border-slate-400 p-2 pl-4 text-slate-800">Liquidez Corrente</td>
            {selectedScenarios.map((sc) => (
              <td key={sc.id} className="border border-slate-400 p-2 text-center">
                {getScenarioData(sc).liqCorrente.toFixed(2)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="border border-slate-400 p-2 pl-4 text-slate-800">Liquidez Seca</td>
            {selectedScenarios.map((sc) => (
              <td key={sc.id} className="border border-slate-400 p-2 text-center">
                {getScenarioData(sc).liqSeca.toFixed(2)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="space-y-6">
        <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-slate-800 pb-2 text-slate-900">
          Notas Explicativas por Cenário
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {selectedScenarios.map((sc) => (
            <div
              key={sc.id}
              className="border border-slate-300 p-5 rounded-md break-inside-avoid shadow-sm bg-slate-50"
            >
              <h3 className="font-bold text-lg mb-4 bg-slate-200 p-2 border-l-4 border-slate-800 text-slate-900 uppercase tracking-wide">
                {sc.name}
              </h3>
              <div className="space-y-5">
                <div>
                  <strong className="text-sm uppercase tracking-wider block mb-1 text-slate-700">
                    Notas do Ativo
                  </strong>
                  <p className="text-sm whitespace-pre-wrap text-slate-900 bg-white p-3 border border-slate-200 rounded-sm">
                    {sc.ativoNotes || 'Nenhuma nota registrada para o Ativo.'}
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <strong className="text-sm uppercase tracking-wider block mb-1 text-slate-700">
                    Notas do Passivo
                  </strong>
                  <p className="text-sm whitespace-pre-wrap text-slate-900 bg-white p-3 border border-slate-200 rounded-sm">
                    {sc.passivoNotes || 'Nenhuma nota registrada para o Passivo.'}
                  </p>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <strong className="text-sm uppercase tracking-wider block mb-1 text-slate-700">
                    Notas do Patrimônio Líquido
                  </strong>
                  <p className="text-sm whitespace-pre-wrap text-slate-900 bg-white p-3 border border-slate-200 rounded-sm">
                    {sc.plNotes || 'Nenhuma nota registrada para o Patrimônio Líquido.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
