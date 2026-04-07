import { WithoutAmortizationTable } from './bank-debts/WithoutAmortizationTable'
import { WithAmortizationTable } from './bank-debts/WithAmortizationTable'
import { SummaryTable } from './bank-debts/SummaryTable'
import { ExplanatoryNote } from './ExplanatoryNote'
import { useState } from 'react'

export function BankDebtsSection() {
  const [note, setNote] = useState('')

  return (
    <div className="space-y-8 animate-fade-in-up mt-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="text-2xl font-bold text-[#0f2e4a]">Endividamento Bancário</h3>
      </div>

      <WithoutAmortizationTable />
      <WithAmortizationTable />
      <SummaryTable />

      <ExplanatoryNote
        title="Notas Explicativas - Endividamento Bancário"
        value={note}
        onChange={setNote}
      />
    </div>
  )
}
