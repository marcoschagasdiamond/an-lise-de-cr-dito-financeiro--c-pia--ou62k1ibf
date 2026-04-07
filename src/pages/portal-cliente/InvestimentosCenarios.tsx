import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/Header'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2, RefreshCw, FileText, Presentation } from 'lucide-react'

import { DescriptiveDataCard } from '@/components/investimentos/DescriptiveDataCard'
import { ScenariosCards } from '@/components/investimentos/ScenariosCards'
import { ConsolidatedSummary } from '@/components/investimentos/ConsolidatedSummary'
import { DREParamsCard } from '@/components/investimentos/DREParamsCard'
import { DRETable10Years, DreProjection } from '@/components/investimentos/DRETable10Years'
import { MetricsSummary } from '@/components/investimentos/MetricsSummary'
import { CustomAccount } from '@/components/investimentos/CustomAccountDialog'
import { calculateIRR, calculateNPV } from '@/lib/calculators'
import { generateProjectPDF } from '@/lib/export-pdf'

export default function InvestimentosCenarios() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle')
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const [plano, setPlano] = useState({
    id: '',
    nome_projeto: '',
    apresentacao_empresa: '',
    apresentacao_projeto: '',
    mercado_justificativa: '',
    config_dre: {
      receitaAno1: 1000000,
      margemDeducoes: 9.25,
      margemCusto: 60,
      margemDespesasOp: 15,
      margemDespesasFin: 0,
      aliquotaIRCSLL: 24,
      crescimentoAnual: 5,
      customAccounts: [] as CustomAccount[],
    },
  })

  const [cenarios, setCenarios] = useState({
    emprestimo: { id: '', ativo: false, dados: { banco: '', valor: 0, taxa_juros: 0, prazo: 12 } },
    investidor: {
      id: '',
      ativo: false,
      dados: { nome_investidor: '', valor_aporte: 0, participacao_acionaria: 0 },
    },
    cotas: {
      id: '',
      ativo: false,
      dados: { tipo_cota: 'diamond', valor_cota: 0, quantidade: 0, retorno_esperado: 5 },
    },
  })

  useEffect(() => {
    if (!user?.id) return
    const loadData = async () => {
      try {
        const planRes = await pb
          .collection('planos_negocio')
          .getList(1, 1, { filter: `user_id="${user.id}"` })
        let currentPlan
        if (planRes.items.length > 0) {
          currentPlan = planRes.items[0]
          setPlano({
            id: currentPlan.id,
            nome_projeto: currentPlan.nome_projeto || '',
            apresentacao_empresa: currentPlan.apresentacao_empresa || '',
            apresentacao_projeto: currentPlan.apresentacao_projeto || '',
            mercado_justificativa: currentPlan.mercado_justificativa || '',
            config_dre: {
              receitaAno1: currentPlan.config_dre?.receitaAno1 ?? 1000000,
              margemDeducoes: currentPlan.config_dre?.margemDeducoes ?? 9.25,
              margemCusto: currentPlan.config_dre?.margemCusto ?? 60,
              margemDespesasOp: currentPlan.config_dre?.margemDespesasOp ?? 15,
              margemDespesasFin: currentPlan.config_dre?.margemDespesasFin ?? 0,
              aliquotaIRCSLL: currentPlan.config_dre?.aliquotaIRCSLL ?? 24,
              crescimentoAnual: currentPlan.config_dre?.crescimentoAnual ?? 5,
              customAccounts: currentPlan.config_dre?.customAccounts ?? [],
            },
          })
        } else {
          currentPlan = await pb.collection('planos_negocio').create({ user_id: user.id })
          setPlano((p) => ({ ...p, id: currentPlan.id }))
        }

        const cenRes = await pb
          .collection('cenarios_financiamento')
          .getFullList({ filter: `plano_negocio_id="${currentPlan.id}"` })
        if (cenRes.length > 0) {
          const newCen = { ...cenarios }
          cenRes.forEach((c) => {
            if (c.tipo_cenario === 'emprestimo')
              newCen.emprestimo = { id: c.id, ativo: c.ativo, dados: c.dados_cenario }
            if (c.tipo_cenario === 'investidor')
              newCen.investidor = { id: c.id, ativo: c.ativo, dados: c.dados_cenario }
            if (c.tipo_cenario === 'cotas')
              newCen.cotas = { id: c.id, ativo: c.ativo, dados: c.dados_cenario }
          })
          setCenarios(newCen as any)
        }
      } catch (e) {
        toast({ description: 'Erro ao carregar dados.', variant: 'destructive' })
      } finally {
        setLoading(false)
        setTimeout(() => setInitialLoadDone(true), 500)
      }
    }
    loadData()
  }, [user])

  const dreProjetado = useMemo<DreProjection[]>(() => {
    const anos = 10
    const dre: DreProjection[] = []
    const emp = cenarios.emprestimo.dados
    const inv = cenarios.investidor.dados
    const cot = cenarios.cotas.dados

    let loanBalance = emp.valor || 0
    const annualRate = (emp.taxa_juros || 0) / 100
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1
    const termMonths = emp.prazo || 12
    const pmt =
      monthlyRate > 0 && termMonths > 0
        ? (loanBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
        : loanBalance / termMonths

    const yearlyInterest = new Array(anos).fill(0)
    const yearlyAmortization = new Array(anos).fill(0)
    let currentMonth = 0
    for (let y = 0; y < anos; y++) {
      let interestThisYear = 0
      let amortThisYear = 0
      for (let m = 0; m < 12; m++) {
        if (currentMonth < termMonths && loanBalance > 0) {
          const interest = loanBalance * monthlyRate
          const amort = Math.min(loanBalance, pmt - interest)
          interestThisYear += interest
          amortThisYear += amort
          loanBalance -= amort
          currentMonth++
        }
      }
      yearlyInterest[y] = interestThisYear
      yearlyAmortization[y] = amortThisYear
    }

    const customAccounts = plano.config_dre.customAccounts || []

    let invTotal = 0
    if (cenarios.emprestimo.ativo) invTotal += emp.valor || 0
    if (cenarios.investidor.ativo) invTotal += inv.valor_aporte || 0
    if (cenarios.cotas.ativo) invTotal += (cot.valor_cota || 0) * (cot.quantidade || 0)

    let currentReceita = plano.config_dre.receitaAno1 || 0

    for (let i = 0; i < anos; i++) {
      let customReceita = 0,
        customCusto = 0,
        customDespesa = 0

      customAccounts.forEach((a) => {
        const val = a.value * Math.pow(1 + (a.crescimentoAnual || 0) / 100, i)
        if (a.type === 'receita') customReceita += val
        else if (a.type === 'custo') customCusto += val
        else customDespesa += val
      })

      const receitaBruta = currentReceita + customReceita
      const deducoes = receitaBruta * ((plano.config_dre.margemDeducoes ?? 9.25) / 100)
      const receitaLiquida = receitaBruta - deducoes

      const margemBase = (plano.config_dre.margemCusto ?? 60) / 100
      const custosVendas = receitaLiquida * margemBase + customCusto

      const resultadoBruto = receitaLiquida - custosVendas

      const depreciacao = receitaBruta * 0.05 // 5% of gross revenue
      const despesasBase = receitaLiquida * ((plano.config_dre.margemDespesasOp ?? 15) / 100)
      const despesasOperacionais = despesasBase + customDespesa + depreciacao

      const amortizacao = cenarios.emprestimo.ativo ? yearlyAmortization[i] : 0
      const juros = cenarios.emprestimo.ativo ? yearlyInterest[i] : 0
      const despFinBase = receitaLiquida * ((plano.config_dre.margemDespesasFin ?? 0) / 100)
      const despesasFinanceiras = despFinBase + juros + amortizacao

      const resultadoAntesIRCSLL = resultadoBruto - despesasOperacionais - despesasFinanceiras
      const aliquotaIR = (plano.config_dre.aliquotaIRCSLL ?? 24) / 100
      const irCsll = resultadoAntesIRCSLL > 0 ? resultadoAntesIRCSLL * aliquotaIR : 0
      const lucroAntesParticipacoes = resultadoAntesIRCSLL - irCsll
      const outrasReducoes = 0
      const resultadoLiquido = lucroAntesParticipacoes - outrasReducoes

      const resultadoOperacional = resultadoBruto - despesasOperacionais
      const ebitda = resultadoOperacional + depreciacao

      const ebitdaMargin = receitaLiquida > 0 ? (ebitda / receitaLiquida) * 100 : 0
      const lucratividade = receitaLiquida > 0 ? (resultadoLiquido / receitaLiquida) * 100 : 0

      let distribuicaoLucros = 0
      if (cenarios.investidor.ativo)
        distribuicaoLucros +=
          Math.max(0, resultadoLiquido) * ((inv.participacao_acionaria || 0) / 100)
      if (cenarios.cotas.ativo)
        distribuicaoLucros +=
          (cot.valor_cota || 0) * (cot.quantidade || 0) * ((cot.retorno_esperado || 0) / 100)

      dre.push({
        ano: i + 1,
        receitaBruta,
        deducoes,
        receitaLiquida,
        custosVendas,
        resultadoBruto,
        despesasOperacionais,
        depreciacao,
        despesasFinanceiras,
        resultadoAntesIRCSLL,
        irCsll,
        lucroAntesParticipacoes,
        outrasReducoes,
        resultadoLiquido,
        ebitda,
        ebitdaMargin,
        lucratividade,
        distribuicaoLucros,
      })
      currentReceita *= 1 + (plano.config_dre.crescimentoAnual || 0) / 100
    }
    return dre
  }, [plano.config_dre, cenarios])

  const summary = useMemo(() => {
    let invTotal = 0,
      cust = 0,
      ret = 0
    const emp = cenarios.emprestimo.dados
    const rate = (emp.taxa_juros || 0) / 100 / 12
    const pmt =
      rate > 0 && emp.prazo > 0
        ? (emp.valor * rate) / (1 - Math.pow(1 + rate, -emp.prazo))
        : (emp.valor || 0) / (emp.prazo || 1)

    if (cenarios.emprestimo.ativo) {
      invTotal += emp.valor
      cust += pmt
      ret += emp.valor * 0.05
    }
    if (cenarios.investidor.ativo) {
      invTotal += cenarios.investidor.dados.valor_aporte
      ret += cenarios.investidor.dados.valor_aporte * 0.05
    }
    if (cenarios.cotas.ativo) {
      invTotal += cenarios.cotas.dados.valor_cota * cenarios.cotas.dados.quantidade
      ret +=
        cenarios.cotas.dados.valor_cota *
        cenarios.cotas.dados.quantidade *
        ((cenarios.cotas.dados.retorno_esperado || 5) / 100)
    }
    return { invTotal, cust, ret }
  }, [cenarios])

  const metricas = useMemo(() => {
    const cf10 = dreProjetado.map((d) => d.resultadoLiquido + d.depreciacao)
    const cf5 = cf10.slice(0, 5)

    const ebtda10 = dreProjetado.map((d) => d.resultadoAntesIRCSLL + d.depreciacao)
    const ebitda10 = dreProjetado.map((d) => d.ebitda)

    const cashFlows10 = [-summary.invTotal, ...cf10]
    const cashFlows5 = [-summary.invTotal, ...cf5]

    const tir = calculateIRR(cashFlows10, 0.1) * 100
    const tirEBTD = calculateIRR([-summary.invTotal, ...ebtda10], 0.1) * 100
    const tirEBITDA = calculateIRR([-summary.invTotal, ...ebitda10], 0.1) * 100

    const rates = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
    const vpl10 = rates.map((r) => calculateNPV(r, cashFlows10))
    const vpl5 = rates.map((r) => calculateNPV(r, cashFlows5))

    const ebitdaMedio = dreProjetado.reduce((acc, d) => acc + d.ebitda, 0) / 10
    const margemMedia = dreProjetado.reduce((acc, d) => acc + d.ebitdaMargin, 0) / 10
    const lucratividadeMedia = dreProjetado.reduce((acc, d) => acc + d.lucratividade, 0) / 10

    return {
      tir: isNaN(tir) ? 0 : tir,
      tirEBTD: isNaN(tirEBTD) ? 0 : tirEBTD,
      tirEBITDA: isNaN(tirEBITDA) ? 0 : tirEBITDA,
      vpl5: rates.map((r, i) => ({ rate: r, value: vpl5[i] })),
      vpl10: rates.map((r, i) => ({ rate: r, value: vpl10[i] })),
      ebitdaMedio,
      margemMedia,
      lucratividadeMedia,
    }
  }, [dreProjetado, summary.invTotal])

  useEffect(() => {
    if (!initialLoadDone || !plano.id) return
    setSyncStatus('syncing')
    const timer = setTimeout(async () => {
      try {
        await pb.collection('planos_negocio').update(plano.id, {
          nome_projeto: plano.nome_projeto,
          apresentacao_empresa: plano.apresentacao_empresa,
          apresentacao_projeto: plano.apresentacao_projeto,
          mercado_justificativa: plano.mercado_justificativa,
          config_dre: plano.config_dre,
        })
        const keys = ['emprestimo', 'investidor', 'cotas'] as const
        for (const k of keys) {
          const c = cenarios[k]
          const payload = {
            plano_negocio_id: plano.id,
            tipo_cenario: k,
            ativo: c.ativo,
            dados_cenario: c.dados,
          }
          if (c.id) await pb.collection('cenarios_financiamento').update(c.id, payload)
          else {
            const res = await pb.collection('cenarios_financiamento').create(payload)
            setCenarios((p) => ({ ...p, [k]: { ...p[k], id: res.id } }))
          }
        }
        try {
          const existingDRE = await pb
            .collection('dre_projetado')
            .getFullList({ filter: `plano_negocio_id="${plano.id}"` })
          const dreByYear = new Map(existingDRE.map((d) => [d.ano, d]))

          for (const d of dreProjetado) {
            const existing = dreByYear.get(d.ano)
            const payload = {
              plano_negocio_id: plano.id,
              ano: d.ano,
              receita: d.receitaLiquida,
              custos: d.custosVendas,
              resultado_operacional: d.resultadoBruto,
              despesas_financeiras: d.despesasFinanceiras,
              resultado_liquido: d.resultadoLiquido,
              distribuicao_lucros: d.distribuicaoLucros,
              ebitda: d.ebitda,
              tir: metricas.tir,
              vpl_5anos: metricas.vpl5.find((v) => v.rate === 0.1)?.value || 0,
              vpl_10anos: metricas.vpl10.find((v) => v.rate === 0.1)?.value || 0,
            }
            if (existing) {
              await pb.collection('dre_projetado').update(existing.id, payload)
            } else {
              await pb.collection('dre_projetado').create(payload)
            }
          }
        } catch (dreErr) {
          console.error('Failed to sync DRE:', dreErr)
        }

        setSyncStatus('saved')
      } catch (err) {
        setSyncStatus('error')
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [plano, cenarios, initialLoadDone, dreProjetado, metricas])

  const handleGeneratePDF = () => {
    generateProjectPDF(plano, cenarios, dreProjetado, metricas)
  }

  const addCustomAccount = (acc: CustomAccount) =>
    setPlano((p) => ({
      ...p,
      config_dre: { ...p.config_dre, customAccounts: [...p.config_dre.customAccounts, acc] },
    }))
  const removeCustomAccount = (id: string) =>
    setPlano((p) => ({
      ...p,
      config_dre: {
        ...p.config_dre,
        customAccounts: p.config_dre.customAccounts.filter((a) => a.id !== id),
      },
    }))

  if (loading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-[#002147]" />
      </div>
    )

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 pb-12">
      <Header title="Plano de Negócios e Cenários" />
      <div className="p-6 md:p-8 w-full max-w-[1400px] mx-auto space-y-8 animate-fade-in">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#002147]">Modelagem do Plano</h2>
            <p className="text-sm text-slate-500">Seus dados são salvos automaticamente.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm font-medium">
            {syncStatus === 'syncing' && (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-blue-600">Salvando...</span>
              </>
            )}
            {syncStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Salvo na nuvem</span>
              </>
            )}
            {syncStatus === 'error' && <span className="text-red-500">Erro ao salvar</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 space-y-6">
            <DescriptiveDataCard plano={plano} setPlano={setPlano} />
          </div>
          <div className="xl:col-span-8">
            <ScenariosCards cenarios={cenarios} setCenarios={setCenarios} />
          </div>
        </div>

        <ConsolidatedSummary summary={summary} />
        <DREParamsCard plano={plano} setPlano={setPlano} />

        <DRETable10Years
          dreProjetado={dreProjetado}
          cenarios={cenarios}
          customAccounts={plano.config_dre.customAccounts}
          onAddAccount={addCustomAccount}
          onRemoveAccount={removeCustomAccount}
        />

        <MetricsSummary metricas={metricas} />

        <Card className="border-[#C5A059]/40 bg-gradient-to-r from-[#002147] to-[#00122e] text-white shadow-xl mt-12 overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none text-[150px] leading-none transform translate-x-1/4 -translate-y-1/4">
            <Presentation />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-[#C5A059]">Gerar Apresentação</CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Exporte todo o projeto estruturado e a DRE de 10 anos em formatos profissionais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleGeneratePDF}
                className="bg-[#C5A059] hover:bg-yellow-600 text-white font-bold h-14 px-8 text-lg"
              >
                <FileText className="w-5 h-5 mr-3" /> Gerar PDF
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold h-14 px-8 text-lg backdrop-blur-sm"
              >
                <Presentation className="w-5 h-5 mr-3" /> Gerar PowerPoint
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
