import React, { createContext, useContext, useState, ReactNode } from 'react'

export type StoreState = {
  paymentCapacity: Record<string, any>[]
  setPaymentCapacity: (val: any) => void
  netResult: Record<string, any>[]
  setNetResult: (val: any) => void
  indicators: Record<string, any>[]
  setIndicators: (val: any) => void
  economicValue: Record<string, any>[]
  setEconomicValue: (val: any) => void
}

const EconomicContext = createContext<StoreState | undefined>(undefined)

export function EconomicProvider({ children }: { children: ReactNode }) {
  const [paymentCapacity, setPaymentCapacity] = useState([
    { id: '1', month: 'Mês 1', cashFlow: 0, debtObligations: 0 },
    { id: '2', month: 'Mês 2', cashFlow: 0, debtObligations: 0 },
  ])
  const [netResult, setNetResult] = useState([
    { id: '1', period: 'Ano 1', revenue: 0, costs: 0, expenses: 0 },
    { id: '2', period: 'Ano 2', revenue: 0, costs: 0, expenses: 0 },
  ])
  const [indicators, setIndicators] = useState([
    { id: '1', indicator: 'Liquidez Corrente', value: 0 },
    { id: '2', indicator: 'Margem EBITDA', value: 0 },
    { id: '3', indicator: 'Nível de Endividamento', value: 0 },
  ])
  const [economicValue, setEconomicValue] = useState([
    { id: '1', metric: 'Múltiplo de EBITDA', value: 0 },
    { id: '2', metric: 'Valor Presente Líquido (VPL)', value: 0 },
    { id: '3', metric: 'Valor de Mercado (Equity)', value: 0 },
  ])

  return (
    <EconomicContext.Provider
      value={{
        paymentCapacity,
        setPaymentCapacity,
        netResult,
        setNetResult,
        indicators,
        setIndicators,
        economicValue,
        setEconomicValue,
      }}
    >
      {children}
    </EconomicContext.Provider>
  )
}

export default function useEconomicStore() {
  const ctx = useContext(EconomicContext)
  if (!ctx) throw new Error('useEconomicStore must be used within EconomicProvider')
  return ctx
}
