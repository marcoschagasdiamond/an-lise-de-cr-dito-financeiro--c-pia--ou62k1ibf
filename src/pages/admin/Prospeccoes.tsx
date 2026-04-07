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
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function AdminProspeccoes() {
  const [clientes, setClientes] = useState<any[]>([])
  const [parceiros, setParceiros] = useState<any[]>([])

  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<any>(null)
  const [selectedParceiroId, setSelectedParceiroId] = useState('')

  const loadData = async () => {
    try {
      const cls = await pb
        .collection('clientes')
        .getFullList({ sort: '-created', expand: 'parceiro_id' })
      setClientes(cls)
      const prs = await pb
        .collection('parceiros')
        .getFullList({ filter: 'status="aprovado"', expand: 'usuario_id' })
      setParceiros(prs)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAssign = async () => {
    if (!selectedParceiroId || !selectedCliente) return
    try {
      await pb.send(`/backend/v1/admin/prospeccoes/${selectedCliente.id}/atribuir`, {
        method: 'POST',
        body: JSON.stringify({ parceiro_id: selectedParceiroId }),
        headers: { 'Content-Type': 'application/json' },
      })
      toast.success('Parceiro atribuído e comissão gerada!')
      setIsAssignOpen(false)
      loadData()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atribuir.')
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background">
      <Header title="Painel de Prospecções" />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Leads e Prospecções</h1>
          <p className="text-muted-foreground">
            Gerencie a entrada de clientes diretos e de parceiros.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Todas as Prospecções</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor Solicitado</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {c.origem === 'parceiro' ? 'Parceiro' : 'Direto'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(c.valor_captacao || 0)}
                    </TableCell>
                    <TableCell>
                      {c.expand?.parceiro_id?.name ||
                        c.expand?.parceiro_id?.email ||
                        'Sem parceiro'}
                    </TableCell>
                    <TableCell>{new Date(c.created).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      {!c.parceiro_id && c.origem === 'solicitar_diagnostico' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCliente(c)
                            setIsAssignOpen(true)
                          }}
                        >
                          Atribuir Parceiro
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Parceiro</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <select
              value={selectedParceiroId}
              onChange={(e) => setSelectedParceiroId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled hidden>
                Selecione uma opção
              </option>
              {parceiros.map((p) => (
                <option key={p.usuario_id} value={p.usuario_id}>
                  {p.nome_empresa} ({p.expand?.usuario_id?.email})
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign}>Atribuir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
