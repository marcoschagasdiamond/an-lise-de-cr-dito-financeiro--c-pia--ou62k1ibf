export type DebtWithoutAmortization = {
  id: string
  institution: string
  creditLimit: string
  interestRate: string
  balance: string
}

export type DebtWithAmortization = {
  id: string
  institution: string
  contractedValue: string
  amortizationSystem: string
  paymentModality: string
  totalPeriods: string
  gracePeriod: string
  remainingPeriods: string
  interestRate: string
  indexer: string
  annualEstimate?: string
  monthlyEffectiveRate?: number
  monthlyPayment?: number
}

export type SummaryTotals = {
  balance: number
  interest: number
  amortization: number
  payment: number
}
