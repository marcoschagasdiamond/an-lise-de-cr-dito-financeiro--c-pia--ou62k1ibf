import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BookOpen, Bot, History, Loader2, Save, Sparkles } from 'lucide-react'
import { useFinancialStore } from '@/store/main'
import { generateFinancialAnalysis } from '@/lib/ai'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ExplanatoryNoteProps {
  title: string
  value: string
  onChange: (value: string) => void
  section?:
    | 'Ativo'
    | 'Passivo'
    | 'Patrimônio Líquido'
    | 'DRE'
    | 'Receitas e Despesas'
    | 'Endividamento'
    | 'Capacidade'
  data?: any[]
  years?: number[]
  isEditable?: boolean
}

export function ExplanatoryNote({
  title,
  value,
  onChange,
  section,
  data = [],
  years = [],
  isEditable = true,
}: ExplanatoryNoteProps) {
  const {
    aiAnalysisAtivo,
    setAiAnalysisAtivo,
    aiAnalysisPassivo,
    setAiAnalysisPassivo,
    aiAnalysisPL,
    setAiAnalysisPL,
    aiAnalysisDRE,
    setAiAnalysisDRE,
    aiAnalysisCurrent,
    setAiAnalysisCurrent,
    aiAnalysisEndividamento,
    setAiAnalysisEndividamento,
    aiAnalysisCapacidade,
    setAiAnalysisCapacidade,
    addAuditLog,
    aiAnalysisHistory,
    addAiAnalysisHistory,
  } = useFinancialStore()

  const { toast } = useToast()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [tone, setTone] = useState('Técnico/Conservador')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  const getGlobalAnalysis = () => {
    if (!section) return ''
    if (section === 'Ativo') return aiAnalysisAtivo
    if (section === 'Passivo') return aiAnalysisPassivo
    if (section === 'Patrimônio Líquido') return aiAnalysisPL
    if (section === 'DRE') return aiAnalysisDRE
    if (section === 'Endividamento') return aiAnalysisEndividamento
    if (section === 'Capacidade') return aiAnalysisCapacidade
    return aiAnalysisCurrent
  }

  const setGlobalAnalysis = (val: string) => {
    if (!section) return
    if (section === 'Ativo') setAiAnalysisAtivo(val)
    if (section === 'Passivo') setAiAnalysisPassivo(val)
    if (section === 'Patrimônio Líquido') setAiAnalysisPL(val)
    if (section === 'DRE') setAiAnalysisDRE(val)
    if (section === 'Endividamento') setAiAnalysisEndividamento(val)
    if (section === 'Receitas e Despesas') setAiAnalysisCurrent(val)
    if (section === 'Capacidade') setAiAnalysisCapacidade(val)
  }

  const globalAnalysis = getGlobalAnalysis()
  const [draftAnalysis, setDraftAnalysis] = useState(globalAnalysis)

  useEffect(() => {
    setDraftAnalysis(globalAnalysis)
  }, [globalAnalysis])

  const handleAnalyze = async () => {
    if (!value || !section) return
    setIsAnalyzing(true)
    try {
      const result = await generateFinancialAnalysis(
        section === 'Capacidade' ? 'Receitas e Despesas' : section,
        data,
        value,
        years,
        tone,
      )
      setGlobalAnalysis(result)
      addAiAnalysisHistory({ section: section as any, text: result, tone })
      addAuditLog(
        `Análise qualitativa das Notas do(a) ${section} gerada por Inteligência Artificial.`,
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveDraft = () => {
    setGlobalAnalysis(draftAnalysis)
    if (section) {
      addAiAnalysisHistory({
        section: section as any,
        text: draftAnalysis,
        tone: 'Editado Manualmente',
      })
      addAuditLog(`Resumo Inteligente do(a) ${section} editado manualmente.`)
    }
    toast({ title: 'Resumo salvo com sucesso' })
  }

  const history = section
    ? aiAnalysisHistory
        .filter((h) => h.section === section)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : []

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg mt-6 border border-slate-200 dark:border-slate-700 shadow-sm print:bg-transparent print:border-none print:p-0 print:shadow-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h4>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {section && (
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="h-8 w-[160px] text-xs bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700">
                <SelectValue placeholder="Tom de Voz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Técnico/Conservador">Técnico/Conservador</SelectItem>
                <SelectItem value="Didático/Executivo">Didático/Executivo</SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={section ? handleAnalyze : undefined}
            disabled={isAnalyzing || !value || !section || !isEditable}
            className="bg-white dark:bg-slate-950 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-900/50 shadow-sm"
          >
            {isAnalyzing ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5 mr-1.5" />
            )}
            Analisar
          </Button>

          <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!section}
                className="bg-white dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 shadow-sm border-slate-300 dark:border-slate-700"
              >
                <History className="w-3.5 h-3.5 mr-1.5" />
                Ver Histórico
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Histórico de Análises {section ? `- ${section}` : ''}</SheetTitle>
                <SheetDescription>
                  Histórico de resumos gerados pela IA ou editados manualmente.
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-4">Nenhum histórico disponível.</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border rounded-md text-sm space-y-2 bg-muted/20"
                      >
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                          <Badge
                            variant="outline"
                            className="font-normal text-[10px] bg-background"
                          >
                            {item.tone}
                          </Badge>
                        </div>
                        <p className="text-foreground text-sm whitespace-pre-wrap">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          if (globalAnalysis) setGlobalAnalysis('')
        }}
        disabled={!isEditable}
        placeholder="Insira as notas explicativas desta seção aqui..."
        className="min-h-[120px] bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-blue-500 shadow-inner resize-y text-slate-800 dark:text-slate-200 print:bg-transparent print:border-0 print:p-0 print:min-h-0 print:shadow-none"
      />

      {(draftAnalysis || globalAnalysis) && (
        <div className="p-3 bg-white dark:bg-slate-950 border border-blue-200/50 dark:border-blue-900/50 rounded-sm shadow-sm mt-3 flex flex-col gap-2 animate-fade-in print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <strong className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm">
              <Sparkles className="w-4 h-4" /> Resumo Inteligente
            </strong>
            {draftAnalysis !== globalAnalysis && (
              <Button
                size="sm"
                onClick={handleSaveDraft}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-3 h-3 mr-1.5" /> Salvar Alterações
              </Button>
            )}
          </div>
          <Textarea
            value={draftAnalysis || ''}
            onChange={(e) => setDraftAnalysis(e.target.value)}
            disabled={!isEditable}
            className="min-h-[100px] text-sm text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus-visible:ring-1 focus-visible:ring-blue-500 resize-y shadow-inner"
            placeholder="Resumo inteligente gerado..."
          />
        </div>
      )}
    </div>
  )
}
