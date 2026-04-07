import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useFinancialStore } from '@/store/main'
import { formatCurrency } from '@/lib/calculators'
import {
  AlertCircle,
  Send,
  Undo2,
  ArrowLeft,
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Save,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { BalanceSheetTable } from './BalanceSheetTable'
import { DRETable } from './DRETable'
import { CurrentExerciseTable } from './CurrentExerciseTable'
import { AttachDocuments } from './AttachDocuments'
import { AuditLog } from './AuditLog'
import { ProfitabilityAlert } from './ProfitabilityAlert'
import { exportBalanceSheetToExcel } from '@/lib/export-utils'
import { SaveDataButton } from '@/components/data-entry/SaveDataButton'
import { cn } from '@/lib/utils'

export function FormContainer() {
  const {
    status,
    setStatus,
    category,
    setCurrentStep,
    balanceSheets,
    companyDetails,
    baseYear,
    saveAnalysis,
  } = useFinancialStore()
  const { toast } = useToast()
  const isEditable = status === 'Rascunho'
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)

  const yearsBP =
    category === 'Média e Grande Porte' ? [baseYear, baseYear + 1, baseYear + 2] : [baseYear + 2]
  const yearsDRE =
    category === 'Média e Grande Porte'
      ? [baseYear, baseYear + 1, baseYear + 2]
      : category === 'Constituição Inicial'
        ? [baseYear + 3]
        : [baseYear + 2]

  const balances = useMemo(
    () =>
      yearsBP.map((y) => {
        const bp = balanceSheets.find((b) => b.year === y) || {
          ativoCirculante: 0,
          estoques: 0,
          ativoNaoCirculante: 0,
          passivoCirculante: 0,
          passivoNaoCirculante: 0,
          patrimonioLiquido: 0,
          year: y,
        }
        const ativo = bp.ativoCirculante + bp.ativoNaoCirculante
        const passivo = bp.passivoCirculante + bp.passivoNaoCirculante + bp.patrimonioLiquido
        const isBalanced = Math.abs(ativo - passivo) < 0.01 // Floating point safety
        return {
          year: y,
          ativo,
          passivo,
          isBalanced,
          diff: Math.abs(ativo - passivo),
        }
      }),
    [balanceSheets, yearsBP],
  )

  const allBalanced = balances.every((b) => b.isBalanced)
  const titleBP =
    category === 'Constituição Inicial' ? 'Balanço de Abertura' : 'Balanço Patrimonial'
  const descBP =
    category === 'Média e Grande Porte'
      ? 'Série histórica de 3 anos com cálculos automatizados.'
      : 'Valores referentes ao ano base.'
  const titleDRE =
    category === 'Constituição Inicial' ? 'DRE Projetado' : 'Demonstrativo de Resultados'
  const descDRE =
    category === 'Constituição Inicial'
      ? 'Projeção para o primeiro ano de operação.'
      : 'Resultados do exercício com Análise Vertical e Horizontal.'
  const isMedia = category === 'Média e Grande Porte'

  const handlePrint = () => {
    window.print()
    setIsSendDialogOpen(false)
  }

  const handleExportExcel = () => {
    exportBalanceSheetToExcel(balanceSheets, yearsBP, companyDetails.razaoSocial)
    toast({
      title: 'Exportação Concluída',
      description: 'Relatório Excel gerado e baixado com sucesso.',
    })
  }

  const handleSaveInternal = () => {
    saveAnalysis()
    setStatus('Em Análise')
    setIsSendDialogOpen(false)
    toast({
      title: 'Análise Salva',
      description: 'A análise foi salva internamente e está disponível na aba "Análises Salvas".',
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up print:m-0 print:p-0 print:space-y-4">
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold border-b-2 border-slate-800 pb-2 mb-4 text-slate-900 uppercase tracking-wide">
          Relatório de Análise de Crédito Financeiro
        </h1>
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-800">
          <div>
            <strong className="text-slate-900">Empresa:</strong>{' '}
            {companyDetails.razaoSocial || 'N/A'}
          </div>
          <div>
            <strong className="text-slate-900">CNPJ:</strong> {companyDetails.cnpj || 'N/A'}
          </div>
          <div>
            <strong className="text-slate-900">Setor:</strong> {companyDetails.setor || 'N/A'}
          </div>
          <div>
            <strong className="text-slate-900">Data de Geração:</strong>{' '}
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      <Card className="print:hidden border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {status === 'Rascunho' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentStep(2)}
                title="Voltar para Cadastro"
                className="hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {companyDetails.razaoSocial || `Perfil: ${category}`}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {category} • Preencha os dados e gerencie a análise
              </p>
            </div>
            <Badge
              variant={status === 'Rascunho' ? 'secondary' : 'default'}
              className="px-3 py-1 text-sm font-medium tracking-wide"
            >
              {status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50 dark:hover:bg-emerald-900/40"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
            </Button>
            {status === 'Rascunho' ? (
              <>
                <SaveDataButton className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700" />
                <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={!allBalanced}
                      className={cn(
                        !allBalanced ? 'opacity-50' : '',
                        'bg-primary hover:bg-primary/90 text-primary-foreground',
                      )}
                    >
                      <Send className="w-4 h-4 mr-2" /> Enviar p/ Análise
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Finalizar e Enviar Análise</DialogTitle>
                      <DialogDescription>
                        A análise atual será finalizada. Escolha como deseja prosseguir com o
                        relatório gerado.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Button
                        variant="outline"
                        className="justify-start h-12"
                        onClick={handlePrint}
                      >
                        <Printer className="w-5 h-5 mr-3 text-slate-500" />
                        <div>
                          <div className="font-semibold">Imprimir / Salvar como PDF</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            Abre a caixa de diálogo de impressão do navegador.
                          </div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-12"
                        onClick={handleSaveInternal}
                      >
                        <Save className="w-5 h-5 mr-3 text-primary" />
                        <div>
                          <div className="font-semibold text-primary">Salvar Internamente</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            Salva um snapshot na aba Análises Salvas.
                          </div>
                        </div>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('Rascunho')
                  toast({ title: 'Revertido para Edição' })
                }}
                className="border-slate-300 dark:border-slate-700"
              >
                <Undo2 className="w-4 h-4 mr-2" /> Reverter p/ Edição
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {status === 'Rascunho' &&
        (!allBalanced ? (
          <Alert
            variant="destructive"
            className="print:hidden border border-red-200 dark:border-red-900/50 shadow-sm bg-red-50 dark:bg-red-950/20 animate-in fade-in slide-in-from-top-2"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-base font-bold text-red-800 dark:text-red-300">
              Balanço Desequilibrado: Ativo ≠ Passivo + PL
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-400">
              O Ativo Total deve ser exatamente igual ao Total do Passivo + Patrimônio Líquido.
              Verifique as marcações em vermelho nas tabelas.
              <ul className="list-disc ml-6 mt-2 space-y-1 font-mono text-xs">
                {balances
                  .filter((b) => !b.isBalanced)
                  .map((b) => (
                    <li key={b.year}>
                      <span className="font-bold font-sans">Ano {b.year}</span>: Diferença de{' '}
                      {formatCurrency(b.diff)}
                    </li>
                  ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="print:hidden border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            <AlertTitle className="text-base font-bold text-emerald-800 dark:text-emerald-300">
              Balanço Validado
            </AlertTitle>
            <AlertDescription className="text-emerald-700 dark:text-emerald-400">
              Todos os totais de Ativo conferem exatamente com Passivo + Patrimônio Líquido. Os
              dados estão consistentes e prontos para envio.
            </AlertDescription>
          </Alert>
        ))}

      <Tabs defaultValue="bp" className="w-full">
        <TabsList
          className={`grid w-full mb-8 h-12 print:hidden bg-slate-100 dark:bg-slate-800/50 p-1 rounded-md ${isMedia ? 'grid-cols-4' : 'grid-cols-3'}`}
        >
          <TabsTrigger
            value="docs"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
          >
            Anexar Documentos
          </TabsTrigger>
          <TabsTrigger
            value="bp"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
          >
            {titleBP}
          </TabsTrigger>
          <TabsTrigger
            value="dre"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
          >
            {titleDRE}
          </TabsTrigger>
          {isMedia && (
            <TabsTrigger
              value="current"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm"
            >
              Receitas e Desp. (Atual)
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="docs" className="print:hidden">
          <AttachDocuments />
        </TabsContent>
        <TabsContent value="bp" className="print:block">
          <BalanceSheetTable
            years={yearsBP}
            balances={balances}
            isEditable={isEditable}
            title={titleBP}
            description={descBP}
          />
          <AuditLog />
        </TabsContent>
        <TabsContent value="dre" className="print:hidden">
          <DRETable
            years={yearsDRE}
            isEditable={isEditable}
            title={titleDRE}
            description={descDRE}
          />
        </TabsContent>
        {isMedia && (
          <TabsContent value="current" className="print:hidden space-y-4">
            <ProfitabilityAlert />
            <CurrentExerciseTable isEditable={isEditable} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
