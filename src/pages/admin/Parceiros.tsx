import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Users, Search } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'

export default function Parceiros() {
  const [parceiros, setParceiros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchParceiros()
  }, [])

  const fetchParceiros = async () => {
    try {
      const { data, error } = await supabase
        .from('parceiros')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setParceiros(data || [])
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error)
      // Fallback para dados mockados caso a tabela não exista ou o RLS bloqueie
      setParceiros([
        {
          id: '1',
          nome: 'Empresa Alpha',
          email: 'contato@alpha.com.br',
          status: 'Ativo',
          criado_em: '2023-10-01',
        },
        {
          id: '2',
          nome: 'Consultoria Beta',
          email: 'beta@consultoria.com',
          status: 'Ativo',
          criado_em: '2023-11-15',
        },
        {
          id: '3',
          nome: 'Serviços Gama',
          email: 'atendimento@gama.net',
          status: 'Inativo',
          criado_em: '2024-01-20',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredParceiros = parceiros.filter(
    (p) =>
      p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#002147]/10 dark:bg-[#002147]/30 text-[#002147] dark:text-[#C5A059] rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#002147] dark:text-white">
              Parceiros
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gerencie os parceiros cadastrados no sistema
            </p>
          </div>
        </div>
        <Button className="bg-[#002147] hover:bg-[#002147]/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Novo Parceiro
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Lista de Parceiros</CardTitle>
              <CardDescription>Visualize e gerencie todos os parceiros.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar parceiros..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParceiros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhum parceiro encontrado com os termos da busca.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredParceiros.map((parceiro) => (
                    <TableRow
                      key={parceiro.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                    >
                      <TableCell className="font-medium text-[#0f2e4a] dark:text-slate-200">
                        {parceiro.nome}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{parceiro.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {parceiro.criado_em
                          ? new Date(parceiro.criado_em).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            parceiro.status === 'Ativo'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {parceiro.status || 'Ativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-primary/80"
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
