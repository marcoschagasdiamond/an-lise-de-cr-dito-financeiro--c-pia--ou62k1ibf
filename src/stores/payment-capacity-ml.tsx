import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useFinancialStore } from '@/store/main'

export type PaymentCapacityMLData = {
  faturamentoBruto: number
  ebitda: number
  despesasFinanceiras: number
  receitasFinanceiras: number
  despesasNaoOp: number
  receitasNaoOp: number
  provisaoImpostos: number
  outrasReceitas: number
  amortizacaoPrincipal: number

  percUtilizar: number
  sistemaAmortizacao: string
  modalidadePagamento: string
  totalPeriodos: number
  carencia: number
  taxaAnual: number
  indexador: string
  percEstimadaAnual: number

  notes: string
}

type StoreState = {
  data: PaymentCapacityMLData
  updateData: (key: keyof PaymentCapacityMLData, value: any) => void
  resetInputs: () => void
  calculated: {
    laip: number
    lucroLiquido: number
    capacidadeMensal: number
    valorPrestacao: number
    limiteCredito: number
    efetivaMensal: number
  }
}

const PaymentCapacityMLContext = createContext<StoreState | undefined>(undefined)

const INITIAL_STATE: PaymentCapacityMLData = {
  faturamentoBruto: 0,
  ebitda: 0,
  despesasFinanceiras: 0,
  receitasFinanceiras: 0,
  despesasNaoOp: 0,
  receitasNaoOp: 0,
  provisaoImpostos: 0,
  outrasReceitas: 0,
  amortizacaoPrincipal: 0,

  percUtilizar: 30,
  sistemaAmortizacao: 'Francês (Price)',
  modalidadePagamento: 'Postecipado',
  totalPeriodos: 36,
  carencia: 0,
  taxaAnual: 18,
  indexador: 'TJLP',
  percEstimadaAnual: 0,

  notes: '',
}

export function PaymentCapacityMLProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PaymentCapacityMLData>(() => {
    try {
      const stored = localStorage.getItem('paymentCapacityData')
      return stored ? { ...INITIAL_STATE, ...JSON.parse(stored) } : INITIAL_STATE
    } catch {
      return INITIAL_STATE
    }
  })

  const { dre } = useFinancialStore()

  // Auto-populate from DRE if empty
  useEffect(() => {
    if (data.faturamentoBruto === 0 && dre && dre.length > 0) {
      const latestDre = [...dre].sort((a, b) => b.year - a.year)[0]
      if (latestDre) {
        const rev = latestDre.receita || 0
        const custos = (latestDre.cpv || 0) + (latestDre.despesasOperacionais || 0)
        const ebitda = rev - custos + (latestDre.depreciacao || 0)

        setData((p) => ({
          ...p,
          faturamentoBruto: rev / 12,
          ebitda: ebitda / 12,
          despesasFinanceiras: (latestDre.juros || 0) / 12,
          receitasFinanceiras: (latestDre.receitasFinanceiras || 0) / 12,
          despesasNaoOp: (latestDre.despesasNaoOperacionais || 0) / 12,
          receitasNaoOp: (latestDre.receitasNaoOperacionais || 0) / 12,
          provisaoImpostos: (latestDre.provisaoImpostos || 0) / 12,
        }))
      }
    }
  }, [dre])

  useEffect(() => {
    localStorage.setItem('paymentCapacityData', JSON.stringify(data))
  }, [data])

  const updateData = (key: keyof PaymentCapacityMLData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const resetInputs = () => {
    setData((p) => ({
      ...INITIAL_STATE,
      faturamentoBruto: p.faturamentoBruto,
      ebitda: p.ebitda,
      despesasFinanceiras: p.despesasFinanceiras,
      receitasFinanceiras: p.receitasFinanceiras,
      despesasNaoOp: p.despesasNaoOp,
      receitasNaoOp: p.receitasNaoOp,
      provisaoImpostos: p.provisaoImpostos,
    }))
  }

  const laip =
    data.ebitda +
    data.receitasFinanceiras -
    data.despesasFinanceiras +
    data.receitasNaoOp -
    data.despesasNaoOp
  const lucroLiquido = laip - data.provisaoImpostos
  const capacidadeMensal = lucroLiquido + data.outrasReceitas - data.amortizacaoPrincipal
  const valorPrestacao = capacidadeMensal * (data.percUtilizar / 100)

  const iMensalJuros = Math.pow(1 + data.taxaAnual / 100, 1 / 12) - 1
  const iMensalIndex = Math.pow(1 + data.percEstimadaAnual / 100, 1 / 12) - 1
  const efetivaMensal = (1 + iMensalJuros) * (1 + iMensalIndex) - 1

  let limiteCredito = 0
  if (efetivaMensal > 0 && data.totalPeriodos > 0) {
    limiteCredito =
      valorPrestacao * ((1 - Math.pow(1 + efetivaMensal, -data.totalPeriodos)) / efetivaMensal)
    if (data.carencia > 0) {
      limiteCredito = limiteCredito / Math.pow(1 + efetivaMensal, data.carencia)
    }
  } else if (efetivaMensal === 0 && data.totalPeriodos > 0) {
    limiteCredito = valorPrestacao * data.totalPeriodos
  }

  return (
    <PaymentCapacityMLContext.Provider
      value={{
        data,
        updateData,
        resetInputs,
        calculated: {
          laip,
          lucroLiquido,
          capacidadeMensal,
          valorPrestacao,
          limiteCredito,
          efetivaMensal: efetivaMensal * 100,
        },
      }}
    >
      {children}
    </PaymentCapacityMLContext.Provider>
  )
}

export function usePaymentCapacityMLStore() {
  const ctx = useContext(PaymentCapacityMLContext)
  if (!ctx)
    throw new Error('usePaymentCapacityMLStore must be used within PaymentCapacityMLProvider')
  return ctx
}
