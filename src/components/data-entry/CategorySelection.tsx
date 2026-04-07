import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Building2, Store, Rocket } from 'lucide-react'
import { useFinancialStore, CompanyCategory } from '@/store/main'

export function CategorySelection() {
  const { setCategory, setCurrentStep } = useFinancialStore()

  const options: Array<{ id: CompanyCategory; icon: any; desc: string }> = [
    {
      id: 'Constituição Inicial',
      icon: Rocket,
      desc: 'Abertura de empresa, balanço inicial e projeções do primeiro ano de operação.',
    },
    {
      id: 'Pequeno Porte',
      icon: Store,
      desc: 'Análise financeira simplificada baseada apenas no ano atual de exercício.',
    },
    {
      id: 'Média e Grande Porte',
      icon: Building2,
      desc: 'Análise profunda e detalhada contemplando o histórico dos últimos 3 anos.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in mt-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Perfil da Empresa</h2>
        <p className="text-muted-foreground text-lg">
          Selecione o porte ou momento da empresa para carregar os formulários adequados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => (
          <Card
            key={opt.id}
            className="cursor-pointer group hover:border-primary hover:shadow-md transition-all duration-300"
            onClick={() => {
              setCategory(opt.id)
              setCurrentStep(2)
            }}
          >
            <CardContent className="p-8 flex flex-col items-center text-center space-y-5">
              <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <opt.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">{opt.id}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{opt.desc}</CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
