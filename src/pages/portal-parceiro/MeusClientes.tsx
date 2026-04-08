import { useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, MoreHorizontal, Building2 } from 'lucide-react'

// Mock data para evitar telas vazias
const mockClients = [
  {
    id: '1',
    nome: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    status: 'Ativo',
    plano: 'Premium',
    ultimaAnalise: '10/05/2026',
  },
  {
    id: '2',
    nome: 'Comercial Varejista S.A.',
    cnpj: '98.765.432/0001-10',
    status: 'Em Análise',
    plano: 'Basic',
    ultimaAnalise: '08/05/2026',
  },
  {
    id: '3',
    nome: 'Indústria Metálica SA',
    cnpj: '45.678.901/0001-23',
    status: 'Inativo',
    plano: 'Pro',
    ultimaAnalise: '15/04/2026',
  },
  {
    id: '4',
    nome: 'Serviços de Logística Express',
    cnpj: '11.222.333/0001-44',
    status: 'Ativo',
    plano: 'Premium',
    ultimaAnalise: '12/05/2026',
  },
]

export default function MeusClientes() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClients = mockClients.filter(
    (c) => c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || c.cnpj.includes(searchTerm),
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <Header title="Portal do Parceiro" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Meus Clientes</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Gerencie sua carteira de clientes, acompanhe status e análises de crédito.
            </p>
          </div>
          <Button className="shrink-0 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50 bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CNPJ..."
                  className="pl-9 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px] pl-6">Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Última Análise</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <span className="text-slate-900">{client.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{client.cnpj}</TableCell>
                      <TableCell className="text-slate-600">{client.plano}</TableCell>
                      <TableCell className="text-slate-600">{client.ultimaAnalise}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            client.status === 'Ativo'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : client.status === 'Em Análise'
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                          }
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-slate-900"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
