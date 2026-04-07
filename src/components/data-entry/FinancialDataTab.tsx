import React from 'react'
import { BankDebtsSection } from './BankDebtsSection'
import { DiverseDebtsSection } from './DiverseDebtsSection'
import { DebtCompositionSection } from './DebtCompositionSection'

export function FinancialDataTab() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Dados Financeiros</h2>
        <p className="text-muted-foreground">
          Preencha os dados de endividamento bancário, diversos e a composição do endividamento.
        </p>
      </div>

      <BankDebtsSection />
      <DiverseDebtsSection />
      <DebtCompositionSection />
    </div>
  )
}
