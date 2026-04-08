import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Users, Search, MoreHorizontal, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Cliente {
  id: string
  nome: string
  email: string
  status: string
  criado_em: string
}

export default function GestaoClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('tipo_usuario', 'cliente')
        .order('criado_em', { ascending: false })

      if (error) {
        throw error
      }

      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      toast({
        title: 'Erro ao carregar clientes',
        description: 'Não foi possível carregar a lista de clientes. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClientes = clientes.filter(
    (cliente) =>
      (cliente.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (cliente.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie e acompanhe os clientes vinculados à sua conta.
          </p>
        </div>
        <Button className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Seus Clientes
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse" />
              ))}
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground">Nenhum cliente encontrado</h3>
              <p className="max-w-sm mt-2">
                Você ainda não possui clientes cadastrados ou nenhum corresponde à sua busca.
              </p>
              {searchTerm && (
                <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2">
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        {cliente.nome || 'Cliente sem nome'}
                      </TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={cliente.status === 'ativo' ? 'default' : 'secondary'}
                          className={
                            cliente.status === 'ativo'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
                              : ''
                          }
                        >
                          {cliente.status === 'ativo' ? 'Ativo' : cliente.status || 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cliente.criado_em
                          ? new Date(cliente.criado_em).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Ver Documentos">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Mais Opções">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
