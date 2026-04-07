import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'
import { useFinancialStore } from '@/store/main'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SaveDataButtonProps {
  onSave?: () => void
  className?: string
}

export function SaveDataButton({ onSave, className }: SaveDataButtonProps) {
  const { saveData } = useFinancialStore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    // Force a small delay to ensure React state has settled and NumInput flushed changes
    await new Promise((resolve) => setTimeout(resolve, 150))

    if (onSave) onSave()
    const success = saveData()

    setIsSaving(false)

    if (success) {
      toast({
        title: 'Alterações salvas com sucesso!',
        description: 'Suas informações foram sincronizadas no banco de dados.',
      })
    } else {
      toast({
        title: 'Erro ao salvar',
        description:
          'Ocorreu um problema ao tentar salvar os dados. Verifique o limite de armazenamento local.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving}
      variant="outline"
      size="sm"
      className={cn(
        'flex items-center gap-2 bg-white hover:bg-muted dark:bg-transparent transition-all',
        className,
      )}
    >
      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
      <span className="sm:hidden">{isSaving ? 'Salvando...' : 'Salvar'}</span>
    </Button>
  )
}
