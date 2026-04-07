import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'
import { useDataStore } from '@/store/main'
import { cn } from '@/lib/utils'

interface ClearDataButtonProps {
  onClear?: () => void
  disabled?: boolean
  className?: string
}

export function ClearDataButton({ onClear, disabled, className }: ClearDataButtonProps) {
  const clearAllData = useDataStore((state) => state.clearAllData)

  const handleClick = () => {
    if (onClear) {
      onClear()
    } else {
      clearAllData()
    }
  }

  return (
    <Button
      variant="destructive"
      onClick={handleClick}
      disabled={disabled}
      className={cn('bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all', className)}
    >
      <Eraser className="w-4 h-4 mr-2" />
      Limpar Dados
    </Button>
  )
}
