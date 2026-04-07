import { useState, useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { generateFinancialAnalysis } from '@/lib/ai'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Sparkles } from 'lucide-react'
import pb from '@/lib/pocketbase/client'

interface Props {
  title: string
  category: string
  data: any[]
  years: number[]
  isEditable?: boolean
}

export function AutomatedExplanatoryNote({
  title,
  category,
  data,
  years,
  isEditable = true,
}: Props) {
  const [content, setContent] = useState('')
  const [profile, setProfile] = useState('TÉCNICO')
  const [isLoading, setIsLoading] = useState(false)
  const [noteId, setNoteId] = useState<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const { toast } = useToast()

  const loadData = async () => {
    try {
      const records = await pb.collection('financial_notes').getFullList({
        filter: `category="${category}"`,
      })
      if (records.length > 0) {
        const record = records[0]
        setNoteId(record.id)
        setContent(record.content || '')
        if (record.profile) setProfile(record.profile)
      } else {
        triggerAnalysis('TÉCNICO', null)
      }
    } catch (e) {
      triggerAnalysis('TÉCNICO', null)
    }
  }

  useEffect(() => {
    if (data && data.length > 0) {
      loadData()
    }
  }, [category])

  const triggerAnalysis = async (selectedProfile: string, existingId: string | null) => {
    setIsLoading(true)
    try {
      const sectionMap: Record<string, string> = {
        'BALANÇO PATRIMONIAL - ATIVO': 'Ativo',
        'BALANÇO PATRIMONIAL - PASSIVO': 'Passivo',
        'PATRIMÔNIO LÍQUIDO': 'Patrimônio Líquido',
      }
      const section = sectionMap[category] || category
      const result = await generateFinancialAnalysis(section, data, '', years, selectedProfile)
      setContent(result)
      await saveToDb(result, selectedProfile, existingId)
    } catch (error) {
      toast({ title: 'Erro ao gerar análise', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const saveToDb = async (newContent: string, newProfile: string, id: string | null = noteId) => {
    try {
      const payload = {
        category,
        content: newContent,
        profile: newProfile,
      }
      if (id) {
        await pb.collection('financial_notes').update(id, payload)
      } else {
        const record = await pb.collection('financial_notes').create(payload)
        setNoteId(record.id)
      }
    } catch (e) {
      console.error('Failed to save financial note', e)
    }
  }

  const handleContentChange = (val: string) => {
    setContent(val)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      saveToDb(val, profile)
    }, 1500)
  }

  const handleProfileChange = (val: string) => {
    setProfile(val)
    triggerAnalysis(val, noteId)
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-lg mt-6 border border-[#0f2e4a]/20 shadow-sm print:bg-transparent print:border-none print:p-0 print:shadow-none animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-[#0f2e4a] dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
            {title}
          </h4>
          {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
        </div>

        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Editar Análise:
          </Label>
          <Select
            value={profile}
            onValueChange={handleProfileChange}
            disabled={isLoading || !isEditable}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 font-medium text-[#0f2e4a] dark:text-slate-300 shadow-sm">
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TÉCNICO">TÉCNICO</SelectItem>
              <SelectItem value="CONSERVADOR">CONSERVADOR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-950/50 flex items-center justify-center rounded-md backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-[#0f2e4a] dark:text-blue-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="text-sm font-semibold">Gerando análise com IA...</span>
            </div>
          </div>
        )}
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          disabled={!isEditable || isLoading}
          placeholder="A análise será gerada automaticamente aqui..."
          className="min-h-[150px] bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus-visible:ring-[#0f2e4a] shadow-inner resize-y text-slate-800 dark:text-slate-200 leading-relaxed print:bg-transparent print:border-0 print:p-0 print:min-h-0 print:shadow-none"
        />
      </div>
    </div>
  )
}
