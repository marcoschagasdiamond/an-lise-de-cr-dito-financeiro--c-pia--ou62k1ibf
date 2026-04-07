import { ExplanatoryNote } from './ExplanatoryNote'
import { useState } from 'react'
import { CompositionTable } from './CompositionTable'

export function DebtCompositionSection() {
  const [noteAmortizacao, setNoteAmortizacao] = useState('')
  const [noteJuros, setNoteJuros] = useState('')

  return (
    <div className="space-y-8 animate-fade-in-up mt-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-bold text-[#0f2e4a] dark:text-slate-100">
          Composição do Endividamento
        </h3>
        <p className="text-muted-foreground text-sm">
          Preencha os valores nas células abaixo para calcular os totais e saldos acumulados
          automaticamente.
        </p>
      </div>

      <div>
        <CompositionTable
          title="COMPOSIÇÃO DO ENDIVIDAMENTO - AMORTIZ. DO PRINCIPAL"
          tableType="amortization"
        />
        <ExplanatoryNote
          title="Notas Explicativas - Amortização do Principal"
          value={noteAmortizacao}
          onChange={setNoteAmortizacao}
        />
      </div>

      <div className="mt-12">
        <CompositionTable
          title="COMPOSIÇÃO DO ENDIVIDAMENTO - PAGTO. DE JUROS FINANCEIROS"
          tableType="interest"
        />
        <ExplanatoryNote
          title="Notas Explicativas - Pagamento de Juros"
          value={noteJuros}
          onChange={setNoteJuros}
        />
      </div>
    </div>
  )
}
