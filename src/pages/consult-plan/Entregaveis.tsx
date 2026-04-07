import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ArrowLeft, LineChart, Activity, ShieldCheck, FileText, Database } from 'lucide-react'

const DELIVERABLES = [
  {
    icon: LineChart,
    title: 'Modelo Financeiro do CAPEX',
    description: 'Projeções detalhadas de investimento, retorno e viabilidade.',
    benefits: 'Precisão na tomada de decisão e clareza no retorno sobre o investimento.',
  },
  {
    icon: Activity,
    title: 'Fluxo e Capacidade de Pagamento',
    description: 'Demonstração clara da geração de caixa.',
    benefits: 'Prova de solvência para credores e investidores.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantias e Mitigadores',
    description: 'Estruturação de colaterais e mecanismos de redução de risco.',
    benefits: 'Aumento do rating de crédito e redução de taxas.',
  },
  {
    icon: FileText,
    title: 'Dossiê Completo',
    description: 'Documentação executiva pronta para submissão.',
    benefits: 'Agilidade na análise bancária e profissionalismo na apresentação.',
  },
  {
    icon: Database,
    title: 'Data Room',
    description: 'Repositório organizado com documentação.',
    benefits: 'Transparência e organização para processos de Due Diligence.',
  },
]

export default function ConsultPlanEntregaveis() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
      <Header title="Entregáveis da Assessoria" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/consult-plan/home">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Nossos Entregáveis</h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Conheça os materiais tangíveis e as saídas estratégicas que desenvolvemos para
            estruturar a sua captação de recursos com excelência e profissionalismo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DELIVERABLES.map((item, idx) => (
            <Card key={idx} className="border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Descrição
                  </span>
                  <p className="text-sm leading-relaxed">{item.description}</p>
                </div>
                <div className="space-y-2 p-4 bg-muted/50 rounded-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Benefícios
                  </span>
                  <p className="text-sm text-muted-foreground">{item.benefits}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
