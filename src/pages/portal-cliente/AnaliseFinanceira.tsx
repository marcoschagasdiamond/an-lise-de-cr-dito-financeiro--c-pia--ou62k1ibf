import { Header } from '@/components/Header'
import { useFinancialStore } from '@/store/main'
import { CategorySelection } from '@/components/data-entry/CategorySelection'
import { CompanyRegistration } from '@/components/data-entry/CompanyRegistration'
import { FormContainer } from '@/components/data-entry/FormContainer'
import { FinancialDataTab } from '@/components/data-entry/FinancialDataTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, TrendingUp, Calculator, Layers, Archive } from 'lucide-react'
import { PaymentCapacity } from '@/components/data-entry/economic/PaymentCapacity'
import { NetResultProjection } from '@/components/data-entry/economic/NetResultProjection'
import { FinancialIndicators } from '@/components/data-entry/economic/FinancialIndicators'
import { EconomicValue } from '@/components/data-entry/economic/EconomicValue'
import { ScenarioManager } from '@/components/data-entry/ScenarioManager'
import { SavedAnalyses } from '@/components/data-entry/SavedAnalyses'
import { cn } from '@/lib/utils'
import { useSearchParams, Link } from 'react-router-dom'
import { useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AnaliseFinanceira() {
  const { currentStep, category, printMode } = useFinancialStore()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  useEffect(() => {
    const initFromProject = async () => {
      if (!projectId) return
      try {
        const project = await pb.collection('projetos').getOne(projectId, { expand: 'cliente_id' })
        const client = project.expand?.cliente_id
        if (client) {
          const mappedCategory =
            project.tipo_empresa === 'inicial'
              ? 'Startups e Empresas em Fase Inicial'
              : project.tipo_empresa === 'pequena'
                ? 'Micro e Pequenas Empresas'
                : 'Média e Grande Porte'

          if ((useFinancialStore as any).setState) {
            ;(useFinancialStore as any).setState((state: any) => ({
              ...state,
              category: mappedCategory,
              companyData: {
                ...state.companyData,
                cnpj: client.cnpj || '',
                razaoSocial: client.razao_social || client.nome,
                telefone: client.telefone || '',
                email: client.email || '',
              },
              currentStep: 3,
            }))
            toast.success('Dados do projeto importados com sucesso!')
          }
        }
      } catch (e) {
        console.error('Error loading project data for analysis', e)
      }
    }
    initFromProject()
  }, [projectId])

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50 dark:bg-background print:h-auto print:overflow-visible print:bg-white print:dark:bg-white print:text-black">
      <div className="print:hidden">
        <Header title="Análise Financeira" />
      </div>

      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full pb-20 print:p-0 print:max-w-none print:w-full print:m-0">
        {projectId && (
          <div className="mb-6 print:hidden">
            <Button variant="outline" asChild>
              <Link to="/portal-cliente/meu-projeto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Meu Projeto
              </Link>
            </Button>
          </div>
        )}

        {currentStep < 3 ? (
          <div className="w-full">
            {currentStep === 1 && <CategorySelection />}
            {currentStep === 2 && <CompanyRegistration />}
          </div>
        ) : (
          <Tabs defaultValue="contabeis" className="w-full animate-fade-in print:block">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-8 h-auto sm:h-12 print:hidden">
              <TabsTrigger value="contabeis" className="gap-2 text-sm sm:text-base py-2 sm:py-1.5">
                <Calculator className="w-4 h-4 hidden xl:block" />
                Dados Contábeis
              </TabsTrigger>
              <TabsTrigger
                value="financeiros"
                className="gap-2 text-sm sm:text-base py-2 sm:py-1.5"
              >
                <LineChart className="w-4 h-4 hidden xl:block" />
                Dados Financeiros
              </TabsTrigger>
              <TabsTrigger value="economica" className="gap-2 text-sm sm:text-base py-2 sm:py-1.5">
                <TrendingUp className="w-4 h-4 hidden xl:block" />
                Econômica
              </TabsTrigger>
              <TabsTrigger value="cenarios" className="gap-2 text-sm sm:text-base py-2 sm:py-1.5">
                <Layers className="w-4 h-4 hidden xl:block" />
                Cenários
              </TabsTrigger>
              <TabsTrigger value="arquivados" className="gap-2 text-sm sm:text-base py-2 sm:py-1.5">
                <Archive className="w-4 h-4 hidden xl:block" />
                Salvas
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="contabeis"
              className={cn(
                'mt-0 outline-none',
                printMode === 'comparison' ? 'print:hidden' : 'print:block',
              )}
            >
              <FormContainer />
            </TabsContent>

            <TabsContent value="financeiros" className="mt-0 outline-none print:hidden">
              <FinancialDataTab />
            </TabsContent>

            <TabsContent value="economica" className="mt-0 outline-none print:hidden">
              {category === 'Média e Grande Porte' ? (
                <div className="space-y-8 animate-fade-in-up mt-8">
                  <div className="flex flex-col gap-2 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Avaliação Econômica</h2>
                    <p className="text-muted-foreground">
                      Preencha as informações detalhadas de capacidade de pagamento, projeções,
                      indicadores e valuation.
                    </p>
                  </div>
                  <PaymentCapacity />
                  <NetResultProjection />
                  <FinancialIndicators />
                  <EconomicValue />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-card text-card-foreground shadow-sm mt-8 animate-fade-in-up">
                  <div className="rounded-full bg-primary/10 p-5 mb-4">
                    <TrendingUp className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Avaliação Econômica</h3>
                  <p className="text-muted-foreground max-w-md">
                    Esta seção está reservada para empresas de Média e Grande Porte, oferecendo
                    análise detalhada de valuation, projeções e capacidade de pagamento.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="cenarios"
              className={cn(
                'mt-0 outline-none',
                printMode === 'comparison' ? 'print:block' : 'print:hidden',
              )}
            >
              <ScenarioManager />
            </TabsContent>

            <TabsContent value="arquivados" className="mt-0 outline-none print:hidden">
              <SavedAnalyses />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
