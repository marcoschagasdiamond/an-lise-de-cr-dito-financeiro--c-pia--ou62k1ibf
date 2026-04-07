import { useState } from 'react'
import { PaymentCapacityML } from './PaymentCapacityML'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useFinancialStore } from '@/store/main'
import { ExplanatoryNotes } from './ExplanatoryNotes'

export function PaymentCapacity() {
  const { category } = useFinancialStore()
  const isMediumLarge = category === 'Média e Grande Porte'

  return (
    <div className="space-y-6 animate-fade-in">
      {isMediumLarge ? (
        <div className="space-y-6">
          <PaymentCapacityML />
          <ExplanatoryNotes category="CAPACIDADE DE PAGAMENTO MENSAL E DE CAPTAÇÃO DE RECURSOS" />
        </div>
      ) : (
        <Card className="border-dashed shadow-none bg-muted/20">
          <CardContent className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-4 opacity-50"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <p className="text-lg font-medium text-foreground mb-1">
              Modelo de Pequeno Porte Oculto
            </p>
            <p className="max-w-md text-sm">
              Ative o perfil <strong>Média e Grande Porte</strong> para visualizar o novo modelo
              detalhado de capacidade de pagamento e captação de recursos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
