import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'

export default function MeusClientes() {
  const { user } = useAuth()
  const [clientes, setClientes] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    pb.collection('clientes')
      .getFullList({
        filter: `parceiro_id = "${user.id}"`,
        sort: '-created',
      })
      .then(setClientes)
      .catch(console.error)
  }, [user])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
      <Header title="Meus Clientes" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Prospecções e Clientes</h1>
            <p className="text-muted-foreground">Acompanhe os clientes indicados por você.</p>
          </div>
          <Button asChild>
            <Link to="/area-parceiro/cadastrar-cliente">
              <PlusCircle className="w-4 h-4 mr-2" /> Cadastrar Cliente
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {clientes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente cadastrado ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Valor Captação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell>{c.nome_responsavel || c.email}</TableCell>
                      <TableCell>{formatCurrency(c.valor_captacao)}</TableCell>
                      <TableCell>{c.status}</TableCell>
                      <TableCell>{new Date(c.created).toLocaleDateString('pt-BR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
