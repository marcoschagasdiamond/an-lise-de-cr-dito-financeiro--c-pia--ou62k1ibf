import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  FileWarning,
  ShieldAlert,
  LineChart,
  SearchX,
  Layers,
  TrendingDown,
  Target,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

const PROBLEMS = [
  {
    title: 'Documentação',
    desc: 'Falta de organização, histórico financeiro inconsistente ou ausência de garantias claras.',
    icon: FileWarning,
  },
  {
    title: 'Riscos',
    desc: 'Riscos do projeto ou do negócio não mapeados e não mitigados adequadamente.',
    icon: ShieldAlert,
  },
  {
    title: 'Modelagem',
    desc: 'Plano de negócios e modelagem financeira fracos ou que não param em pé.',
    icon: LineChart,
  },
  {
    title: 'Fonte Errada',
    desc: 'Buscar recursos no lugar errado, com custo e prazo inadequados para o perfil do projeto.',
    icon: SearchX,
  },
]

const PROMISES = [
  {
    title: 'Mais Alternativas',
    desc: 'Acesso a um leque muito maior de fundos, bancos, FIDCs e investidores qualificados.',
    icon: Layers,
  },
  {
    title: 'Menor Custo',
    desc: 'Estruturação focada em otimizar taxas, prazos e garantias, reduzindo o custo de capital.',
    icon: TrendingDown,
  },
  {
    title: 'Maior Probabilidade',
    desc: 'Apresentação profissional que aumenta drasticamente as chances de aprovação no comitê.',
    icon: Target,
  },
]

const METHODOLOGY = [
  {
    phase: 'Fase 01',
    title: 'Diagnóstico & Viabilidade',
    time: 'Dias 01 a 15',
    desc: 'Mapeamento profundo da saúde financeira, garantias e necessidades reais de capital.',
  },
  {
    phase: 'Fase 02',
    title: 'Estruturação & Modelagem',
    time: 'Dias 16 a 30',
    desc: 'Criação do Business Plan, Teaser, Pitch Deck e adequação do modelo financeiro.',
  },
  {
    phase: 'Fase 03',
    title: 'Roadshow & Fechamento',
    time: 'Dias 31 a 60',
    desc: 'Apresentação aos fundos adequados, negociação de Term Sheets e due diligence.',
  },
]

export default function ConsultPlanHome() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      <Header title="Consult Plan" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 text-center space-y-8 animate-fade-in-up">
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
              Transforme seu projeto em uma{' '}
              <span className="text-blue-600 dark:text-blue-400">operação financiável</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Soluções estratégicas para potencializar o crescimento do seu negócio através de
              inteligência financeira e conexões estratégicas.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto text-lg h-14 px-8">
                {user ? (
                  <Link
                    to={
                      user.role === 'administrador'
                        ? '/admin/dashboard'
                        : user.role === 'parceiro'
                          ? '/portal/parceiro'
                          : '/portal-cliente/dashboard'
                    }
                  >
                    Acessar Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                ) : (
                  <Link to="/consult-plan/solicitar-diagnostico">
                    Agendar Diagnóstico <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto text-lg h-14 px-8"
              >
                <Link to="/consult-plan/funding">Explorar Fontes</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Problem Identification Section */}
        <section className="py-20 bg-muted/30 px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Por Que Captações Travam?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Os principais obstáculos que impedem empresas de acessarem os melhores recursos do
                mercado.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROBLEMS.map((item, i) => (
                <Card
                  key={i}
                  className="bg-background border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <CardHeader>
                    <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <item.icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Nossa Promessa</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Como a metodologia Consult Plan transforma a sua jornada de captação.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {PROMISES.map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-5">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                    <item.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section className="py-24 bg-slate-900 dark:bg-slate-950 text-slate-50 px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">O Método 30-60 Dias</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Um processo ágil e estruturado para levar seu projeto do diagnóstico ao dinheiro na
                conta.
              </p>
            </div>
            <div className="relative pt-4">
              <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {METHODOLOGY.map((item, i) => (
                  <Card
                    key={i}
                    className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 text-slate-50 relative overflow-hidden group hover:border-blue-500/50 transition-colors"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors"></div>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-blue-400 font-mono text-sm font-semibold bg-blue-400/10 px-3 py-1 rounded-full">
                          {item.phase}
                        </span>
                        <span className="text-slate-400 text-sm font-medium">{item.time}</span>
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 text-center space-y-8 bg-blue-50 dark:bg-blue-950/20">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">
              Pronto para destravar o crescimento da sua empresa?
            </h2>
            <p className="text-lg text-muted-foreground">
              Fale com nossos especialistas e descubra como podemos estruturar a melhor operação de
              crédito para o seu momento.
            </p>
            <Button size="lg" className="text-lg h-14 px-10 shadow-lg" asChild>
              {user ? (
                <Link
                  to={
                    user.role === 'administrador'
                      ? '/admin/dashboard'
                      : user.role === 'parceiro'
                        ? '/portal/parceiro'
                        : '/portal-cliente/dashboard'
                  }
                >
                  Acessar meu Dashboard
                </Link>
              ) : (
                <Link to="/consult-plan/solicitar-diagnostico">Agendar Diagnóstico Gratuito</Link>
              )}
            </Button>
          </div>
        </section>
      </main>

      {/* Site Footer */}
      <footer className="bg-card py-16 px-4 border-t">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">D</span>
              </div>
              <h3 className="text-xl font-bold text-primary">Diamond Group</h3>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              Especialistas em inteligência financeira, reestruturação e captação de recursos para
              impulsionar o seu negócio ao próximo nível.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Navegação</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/consult-plan/home" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/consult-plan/funding" className="hover:text-primary transition-colors">
                  Fontes de Funding
                </Link>
              </li>
              <li>
                <Link
                  to="/consult-plan/entregaveis"
                  className="hover:text-primary transition-colors"
                >
                  Entregáveis
                </Link>
              </li>
              <li>
                <Link
                  to="/consult-plan/beneficios"
                  className="hover:text-primary transition-colors"
                >
                  Benefícios na Prática
                </Link>
              </li>
              <li>
                <Link
                  to="/consult-plan/solicitar-diagnostico"
                  className="hover:text-primary transition-colors"
                >
                  Solicitar Diagnóstico
                </Link>
              </li>
              <li>
                <Link to="/consult-plan/contato" className="hover:text-primary transition-colors">
                  Formulário de Contato
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" /> contato@diamondgroup.com.br
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" /> +55 (11) 9999-9999
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" /> São Paulo, SP
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Diamond Group. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
