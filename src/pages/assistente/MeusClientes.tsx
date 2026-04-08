import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Cliente {
  id: string
  nome?: string
  email: string
  status?: string
  created_at?: string
}

export default function MeusClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function fetchClientes() {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('tipo_usuario', 'cliente')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar clientes:', error.message)
          if (mounted) setClientes([])
          return
        }

        if (mounted && data) {
          setClientes(data as Cliente[])
        }
      } catch (err) {
        console.error('Erro inesperado:', err)
        if (mounted) setClientes([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchClientes()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Clientes</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie e acompanhe a lista de clientes vinculados.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Todos os clientes cadastrados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed">
              <p>Nenhum cliente encontrado no momento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">
                        {cliente.nome || 'Não informado'}
                      </TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {cliente.created_at
                          ? new Date(cliente.created_at).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cliente.status === 'ativo' ? 'default' : 'secondary'}
                          className={
                            cliente.status === 'ativo' ? 'bg-green-600 hover:bg-green-700' : ''
                          }
                        >
                          {cliente.status || 'Indefinido'}
                        </Badge>
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
