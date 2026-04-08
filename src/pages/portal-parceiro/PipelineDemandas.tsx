import { useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MoreHorizontal, Calendar } from 'lucide-react'

// Mock data to replace Pocketbase integration temporarily
const mockDemandas = [
  {
    id: '1',
    titulo: 'Análise de Crédito',
    empresa: 'Tech Solutions Ltda',
    valor: 'R$ 50.000',
    status: 'Novo',
    data: '12/05/2026',
  },
  {
    id: '2',
    titulo: 'Renovação de Limite',
    empresa: 'Comercial Varejista S.A.',
    valor: 'R$ 120.000',
    status: 'Em Análise',
    data: '10/05/2026',
  },
  {
    id: '3',
    titulo: 'Financiamento',
    empresa: 'Indústria Metálica SA',
    valor: 'R$ 500.000',
    status: 'Aprovado',
    data: '08/05/2026',
  },
  {
    id: '4',
    titulo: 'Capital de Giro',
    empresa: 'Serviços de Logística',
    valor: 'R$ 200.000',
    status: 'Recusado',
    data: '05/05/2026',
  },
  {
    id: '5',
    titulo: 'Antecipação',
    empresa: 'Tech Solutions Ltda',
    valor: 'R$ 30.000',
    status: 'Em Análise',
    data: '13/05/2026',
  },
]

const columns = [
  { id: 'Novo', title: 'Novas Demandas', color: 'bg-slate-100' },
  { id: 'Em Análise', title: 'Em Análise', color: 'bg-blue-50' },
  { id: 'Aprovado', title: 'Aprovado', color: 'bg-emerald-50' },
  { id: 'Recusado', title: 'Recusado', color: 'bg-rose-50' },
]

export default function PipelineDemandas() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <Header title="Portal do Parceiro" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Pipeline de Demandas
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Acompanhe o status das solicitações de crédito dos seus clientes.
            </p>
          </div>
          <Button className="shrink-0 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Demanda
          </Button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`flex flex-col w-[320px] shrink-0 rounded-xl ${column.color} p-4 border border-border/50`}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-semibold text-slate-800">{column.title}</h3>
                <span className="bg-white text-slate-600 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                  {mockDemandas.filter((d) => d.status === column.id).length}
                </span>
              </div>

              <div className="space-y-3">
                {mockDemandas
                  .filter((d) => d.status === column.id)
                  .map((demanda) => (
                    <Card
                      key={demanda.id}
                      className="border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-semibold text-slate-900 line-clamp-1">
                            {demanda.titulo}
                          </CardTitle>
                          <p className="text-xs text-slate-500 font-medium">{demanda.empresa}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 -mt-1 -mr-2"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-slate-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {demanda.data}
                          </div>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                            {demanda.valor}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
