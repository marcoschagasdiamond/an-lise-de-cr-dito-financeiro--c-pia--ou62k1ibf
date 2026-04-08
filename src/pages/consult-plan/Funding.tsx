import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Landmark,
  Building2,
  Map as MapIcon,
  LineChart,
  Building,
  Globe,
  CheckCircle2,
} from 'lucide-react'

const fundingSources = [
  {
    id: 1,
    title: 'Bancos Comerciais',
    description: 'Linhas tradicionais de crédito corporativo',
    icon: Landmark,
    features: ['Capital de giro', 'Antecipação de recebíveis', 'Financiamento de máquinas'],
    details:
      'Os bancos comerciais oferecem uma ampla gama de produtos tradicionais, ideais para necessidades de curto e médio prazo. As taxas e condições variam de acordo com o rating da empresa e as garantias oferecidas.',
  },
  {
    id: 2,
    title: 'Fundos de Crédito',
    description: 'Fundos de crédito privado',
    icon: Building2,
    features: [
      'FIDCs',
      'Debêntures',
      'Prazos mais flexíveis',
      'Menor exigência de garantias reais',
    ],
    details:
      'Estruturas como FIDCs e emissão de Debêntures permitem acessar o mercado de capitais com maior flexibilidade estrutural do que os bancos tradicionais, muitas vezes focando nos recebíveis ou no fluxo de caixa futuro.',
  },
  {
    id: 3,
    title: 'Fomento Estadual',
    description: 'Agências de desenvolvimento regional',
    icon: MapIcon,
    features: ['Taxas subsidiadas', 'Prazos longos', 'Foco em desenvolvimento local'],
    details:
      'Agências estaduais de fomento possuem linhas com custos inferiores aos de mercado para projetos que gerem emprego, renda e desenvolvimento tecnológico na sua região de atuação.',
  },
  {
    id: 4,
    title: 'Equity via Fundos',
    description: 'Participação societária para crescimento',
    icon: LineChart,
    features: ['Venture Capital', 'Private Equity', 'Smart Money'],
    details:
      'A captação via Equity envolve a venda de participação societária. Além do capital, atrai "Smart Money" — conhecimento, networking e governança essenciais para escalar o negócio de forma exponencial.',
  },
  {
    id: 5,
    title: 'BNDES',
    description: 'Operações diretas acima de R$ 20M ou via credenciados abaixo',
    icon: Building,
    features: ['Taxas atrativas (TLP)', 'Carência estendida', 'Foco em inovação e ESG'],
    details:
      'O Banco Nacional de Desenvolvimento Econômico e Social é a principal ferramenta de financiamento de longo prazo no país, apoiando desde a aquisição de equipamentos até grandes projetos de infraestrutura e inovação.',
  },
  {
    id: 6,
    title: 'Linhas Internacionais',
    description: 'Funding cross-border',
    icon: Globe,
    features: ['Captação em moeda estrangeira', 'Trade finance', 'Exim banks'],
    details:
      'Para empresas com receitas em moeda estrangeira ou envolvidas em comércio exterior, linhas internacionais oferecem taxas competitivas globais. Inclui operações com agências de crédito à exportação (Exim Banks) e multilaterais.',
  },
]

export default function ConsultPlanFunding() {
  const navigate = useNavigate()
  const [selectedSource, setSelectedSource] = useState<(typeof fundingSources)[0] | null>(null)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <Header title="Fontes de Funding" />

      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-border pb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/consult-plan/home')}
            className="w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Explore as Fontes de Funding
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Conheça os diferentes instrumentos financeiros disponíveis para estruturação do seu
              projeto.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fundingSources.map((source) => (
            <Card
              key={source.id}
              className="flex flex-col hover:shadow-md transition-shadow duration-300 border-border/50"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-100/80 flex items-center justify-center mb-4 text-blue-700">
                  <source.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-xl leading-tight">{source.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  {source.description}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Características
                  </p>
                  <ul className="space-y-2.5">
                    {source.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 mr-2.5 text-blue-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50 mt-auto">
                <Button
                  variant="ghost"
                  className="w-full text-blue-700 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => setSelectedSource(source)}
                >
                  Saiba Mais
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedSource} onOpenChange={(open) => !open && setSelectedSource(null)}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedSource && (
            <div>
              <DialogHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 text-blue-700">
                  <selectedSource.icon className="w-6 h-6" />
                </div>
                <DialogTitle className="text-2xl">{selectedSource.title}</DialogTitle>
                <DialogDescription className="text-base pt-1.5 font-medium text-slate-600">
                  {selectedSource.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-2">
                <p className="text-slate-700 leading-relaxed text-sm">{selectedSource.details}</p>
                <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-sm text-slate-900 mb-4 flex items-center">
                    Principais Características
                  </h4>
                  <ul className="grid gap-3">
                    {selectedSource.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-3 text-blue-600 shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
