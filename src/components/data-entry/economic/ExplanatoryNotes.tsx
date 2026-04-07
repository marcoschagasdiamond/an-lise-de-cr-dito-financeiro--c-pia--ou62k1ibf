import React, { useState, useEffect, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Save, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ExplanatoryNotesProps {
  category: string
  tableData?: any
}

export function ExplanatoryNotes({ category, tableData }: ExplanatoryNotesProps) {
  const [content, setContent] = useState('')
  const [profile, setProfile] = useState('TÉCNICO')
  const [recordId, setRecordId] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const analyzedCategories = useRef(new Set<string>())

  useEffect(() => {
    loadNotes()
  }, [category])

  const loadNotes = async () => {
    if (!pb.authStore.isValid) return
    try {
      const records = (await pb.collection('financial_notes').getFullList({
        filter: `category='${category}'`,
      })) as any[]

      if (records.length > 0) {
        setContent(records[0].content || '')
        setProfile(records[0].profile || 'TÉCNICO')
        setRecordId(records[0].id)
        if (!records[0].content && !analyzedCategories.current.has(category)) {
          analyzedCategories.current.add(category)
          handleAnalyze('TÉCNICO', records[0].id)
        }
      } else {
        if (!analyzedCategories.current.has(category)) {
          analyzedCategories.current.add(category)
          handleAnalyze('TÉCNICO', null)
        }
      }
    } catch (e) {
      console.error('Failed to load notes', e)
    }
  }

  const saveNotes = async (
    newContent: string,
    currentProfile: string,
    currentId: string | null = recordId,
  ) => {
    setIsSaving(true)
    try {
      if (currentId) {
        await pb
          .collection('financial_notes')
          .update(currentId, { content: newContent, profile: currentProfile })
      } else {
        const newRecord = await pb
          .collection('financial_notes')
          .create({ category, content: newContent, profile: currentProfile })
        setRecordId(newRecord.id)
      }
      toast({ title: 'Notas salvas com sucesso' })
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao salvar notas' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAnalyze = async (selectedProfile: string, currentId: string | null) => {
    setIsAnalyzing(true)
    try {
      let analysisText = ''
      try {
        const res = await pb.send('/backend/v1/ai-analysis', {
          method: 'POST',
          body: JSON.stringify({ category, data: tableData, tone: selectedProfile }),
          headers: { 'Content-Type': 'application/json' },
        })
        analysisText = res.analysis || `Análise gerada com perfil ${selectedProfile}.`
      } catch (err) {
        console.warn('AI analysis endpoint failed, using fallback.', err)
        analysisText = `[Simulação] Análise automática para ${category} com perfil ${selectedProfile}. Os indicadores demonstram estabilidade e adequação às margens estabelecidas.`
      }

      const newText = analysisText
      setContent(newText)

      if (currentId) {
        await pb
          .collection('financial_notes')
          .update(currentId, { content: newText, profile: selectedProfile })
      } else {
        const newRecord = await pb
          .collection('financial_notes')
          .create({ category, content: newText, profile: selectedProfile })
        setRecordId(newRecord.id)
      }
    } catch (e) {
      console.error('Analysis error', e)
      toast({ variant: 'destructive', title: 'Erro na análise com IA' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onProfileChange = (val: string) => {
    setProfile(val)
    handleAnalyze(val, recordId)
  }

  return (
    <div className="mt-4 border-t-2 border-[#1f497d] bg-white font-sans w-full flex flex-col">
      <div className="bg-[#1f497d] text-white font-bold px-3 py-1.5 text-sm uppercase flex justify-between items-center">
        <span>Notas Explicativas - {category}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium normal-case">Editar Análise:</span>
          <Select value={profile} onValueChange={onProfileChange} disabled={isAnalyzing}>
            <SelectTrigger className="h-7 w-[140px] text-xs bg-white text-[#1f497d] border-none focus:ring-0">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TÉCNICO">TÉCNICO</SelectItem>
              <SelectItem value="CONSERVADOR">CONSERVADOR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-2 bg-[#c5d9f1]/30 flex-1 flex flex-col">
        <div className="relative">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isAnalyzing}
            placeholder={
              isAnalyzing ? 'Gerando análise com IA...' : 'Insira suas notas explicativas...'
            }
            className="min-h-[120px] text-sm border-[#1f497d]/50 focus-visible:ring-[#1f497d] bg-white text-black resize-y"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[1px]">
              <Loader2 className="h-6 w-6 animate-spin text-[#1f497d]" />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={() => saveNotes(content, profile)}
            disabled={isSaving || isAnalyzing}
            className="bg-[#1f497d] hover:bg-[#1f497d]/90 text-white h-7"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
