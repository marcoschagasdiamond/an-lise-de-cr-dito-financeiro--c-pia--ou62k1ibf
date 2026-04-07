import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { ClientForm } from './components/ClientForm'
import { ProjectTracker } from './components/ProjectTracker'
import { NotificationsPanel } from './components/NotificationsPanel'
import { ProjectDocumentos } from './components/ProjectDocumentos'
import { PartnerDashboard } from './components/PartnerDashboard'

export default function GestaoClientes() {
  const { user } = useAuth()
  const [projetos, setProjetos] = useState<any[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProjeto, setSelectedProjeto] = useState<any>(null)

  const loadProjetos = async () => {
    if (!user) return
    try {
      const records = await pb.collection('projetos').getFullList({
        expand: 'cliente_id',
        sort: '-created',
      })
      setProjetos(records)
      if (records.length > 0 && !selectedProjeto) {
        setSelectedProjeto(records[0])
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadProjetos()
  }, [user])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Gestão de Clientes" />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 overflow-y-auto border-r border-border space-y-8">
          <PartnerDashboard />

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" /> Clientes e Projetos
              </h2>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Novo Cliente
              </Button>
            </div>

            <div className="mb-2">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {projetos.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => setSelectedProjeto(proj)}
                    className={`p-4 border rounded-lg text-left min-w-[280px] transition-colors ${selectedProjeto?.id === proj.id ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-muted/50'}`}
                  >
                    <p className="font-semibold text-foreground truncate">
                      {proj.expand?.cliente_id?.nome}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      CNPJ: {proj.expand?.cliente_id?.cnpj || 'N/A'}
                    </p>
                  </button>
                ))}
                {projetos.length === 0 && (
                  <div className="w-full py-8 text-center text-muted-foreground border border-dashed rounded-lg">
                    Nenhum projeto encontrado. Comece cadastrando um novo cliente.
                  </div>
                )}
              </div>
            </div>

            {selectedProjeto && (
              <div className="space-y-6">
                <ProjectTracker
                  projetoId={selectedProjeto.id}
                  faseAtual={selectedProjeto.fase_atual || 1}
                />

                {selectedProjeto.fase_atual >= 8 && (
                  <div className="pt-6 border-t border-border">
                    <ProjectDocumentos projetoId={selectedProjeto.id} isPartner={true} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-80 shrink-0 hidden lg:block bg-muted/10">
          <NotificationsPanel />
        </div>
      </div>

      <ClientForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          loadProjetos()
        }}
      />
    </div>
  )
}
