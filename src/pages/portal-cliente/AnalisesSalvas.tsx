import { Header } from '@/components/Header'
import { SavedAnalyses } from '@/components/data-entry/SavedAnalyses'

export default function AnalisesSalvas() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Análises Salvas" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
        <SavedAnalyses />
      </div>
    </div>
  )
}
