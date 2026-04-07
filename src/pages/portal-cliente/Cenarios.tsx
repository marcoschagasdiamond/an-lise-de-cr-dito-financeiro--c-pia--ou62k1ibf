import { Header } from '@/components/Header'
import { ScenarioManager } from '@/components/data-entry/ScenarioManager'

export default function Cenarios() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Gerenciamento de Cenários" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
        <ScenarioManager />
      </div>
    </div>
  )
}
