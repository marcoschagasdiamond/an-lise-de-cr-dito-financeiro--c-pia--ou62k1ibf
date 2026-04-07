import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ArrowLeft, Award, RefreshCcw, Clock, Target } from 'lucide-react'

const BENEFITS = [
  {
    icon: Award,
    title: 'Credibilidade Institucional',
    description: 'Apresentação profissional que transmite confiança.',
    example: 'Sua empresa é vista pelo banco como um player de baixo risco e alta governança.',
  },
  {
    icon: RefreshCcw,
    title: 'Redução de Retrabalho',
    description: 'Documentação completa desde a primeira submissão.',
    example: "Evite o 'vai e vem' de documentos que costuma travar processos por meses.",
  },
  {
    icon: Clock,
    title: 'Economia de Tempo',
    description: 'Processo estruturado elimina meses de tentativa e erro.',
    example: 'Reduza o ciclo de captação de 12 meses para 60-90 dias.',
  },
  {
    icon: Target,
    title: 'Foco no Que Importa',
    description: 'Você concentra energia em tocar o negócio.',
    example: 'Nós cuidamos da burocracia e da modelagem enquanto você foca na operação.',
  },
]

export default function ConsultPlanBeneficios() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
      <Header title="Benefícios na Prática" />
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-fade-in-up">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/consult-plan/home">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            O Impacto Real no seu Negócio
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Descubra como a nossa assessoria transforma processos lentos e burocráticos em captações
            ágeis, poupando seu tempo e protegendo a imagem da sua empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {BENEFITS.map((item, idx) => (
            <Card
              key={idx}
              className="border-border/50 shadow-sm hover:border-primary/50 transition-colors group"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <p className="text-muted-foreground">{item.description}</p>
                <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg relative">
                  <span className="text-xs font-bold uppercase text-primary mb-1 block">
                    Na prática
                  </span>
                  <p className="text-sm italic font-medium leading-relaxed">"{item.example}"</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
