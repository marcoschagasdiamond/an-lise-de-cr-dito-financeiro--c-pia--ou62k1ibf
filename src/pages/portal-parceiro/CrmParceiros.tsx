import { Header } from '@/components/Header'
import { Briefcase } from 'lucide-react'

export default function CrmParceiros() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="CRM Parceiros" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full h-full flex items-center justify-center">
        <div className="text-center max-w-md space-y-4 text-muted-foreground animate-fade-in-up">
          <Briefcase className="w-16 h-16 mx-auto text-primary/40" />
          <h2 className="text-xl font-semibold text-foreground">CRM Parceiros</h2>
          <p>
            Espaço centralizado para administrar sua relação com a plataforma, conferir comissões,
            indicadores e comunicações oficiais.
          </p>
        </div>
      </div>
    </div>
  )
}
