import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

import { useAdmin } from '@/hooks/use-admin'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Trash2, Key, ShieldOff, ShieldCheck, Eye, Edit, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'

export default function AdminClientes() {
  const { isAdmin, hasPermission, loading: adminLoading } = useAdmin()
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<any[]>([])
  const [parceiros, setParceiros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const hasLoaded = useRef(false)
  const isFetching = useRef(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [filterOrigem, setFilterOrigem] = useState('todas')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [filterParceiro, setFilterParceiro] = useState('todos')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [viewClient, setViewClient] = useState<any>(null)
  const [editClient, setEditClient] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('')
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!adminLoading && !hasPermission('gerenciar_clientes')) {
      toast.error('Acesso negado.')
      navigate('/admin/dashboard')
    }
  }, [adminLoading, hasPermission, navigate])

  const loadData = async () => {
    if (isFetching.current) return
    isFetching.current = true
    try {
      const [clientesRes, parceirosRes, projetosRes] = await Promise.all([
        pb.collection('clientes').getFullList({ sort: '-created', expand: 'parceiro_id, user_id' }),
        pb.collection('parceiros').getFullList({ sort: 'nome_empresa' }),
        pb.collection('projetos').getFullList(),
      ])

      const projetosMap = projetosRes.reduce((acc: any, p: any) => {
        if (!acc[p.cliente_id]) acc[p.cliente_id] = p
        return acc
      }, {})

      const enhancedClientes = clientesRes.map((c) => ({
        ...c,
        tipo_empresa: projetosMap[c.id]?.tipo_empresa || 'Não definido',
      }))

      setClientes(enhancedClientes)
      setParceiros(parceirosRes)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar dados.')
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }

  useEffect(() => {
    if (isAdmin && hasPermission('gerenciar_clientes') && !hasLoaded.current) {
      hasLoaded.current = true
      loadData()
    }
  }, [isAdmin, hasPermission])

  const handleToggleStatus = async (cliente: any) => {
    try {
      const newStatus = cliente.status === 'ativo' ? 'inativo' : 'ativo'
      await pb.collection('clientes').update(cliente.id, { status: newStatus })
      toast.success(`Status alterado para ${newStatus}.`)
      loadData()
    } catch (err) {
      toast.error('Erro ao atualizar status.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await pb.collection('clientes').delete(id)
      toast.success('Cliente deletado.')
      loadData()
    } catch (err) {
      toast.error('Erro ao deletar cliente.')
    }
  }

  const handleSetPassword = async () => {
    if (!selectedClient?.user_id) {
      toast.error('Cliente não possui um usuário vinculado.')
      return
    }
    if (newPassword.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    try {
      await pb.collection('users').update(selectedClient.user_id, {
        password: newPassword,
        passwordConfirm: newPassword,
      })
      toast.success('Senha atualizada com sucesso.')
      setIsPasswordModalOpen(false)
      setNewPassword('')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao atualizar senha.')
    }
  }

  const handleSaveEdit = async () => {
    if (!editClient) return
    try {
      await pb.collection('clientes').update(editClient.id, {
        nome: editClient.nome,
        email: editClient.email,
        telefone: editClient.telefone,
        cnpj: editClient.cnpj,
      })
      toast.success('Cliente atualizado com sucesso.')
      setEditClient(null)
      loadData()
    } catch (err) {
      toast.error('Erro ao atualizar cliente.')
    }
  }

  const filteredClientes = clientes.filter((c) => {
    const matchesSearch =
      c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj?.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'todos' || c.status === filterStatus
    const matchesOrigem = filterOrigem === 'todas' || c.origem === filterOrigem
    const matchesTipo = filterTipo === 'todos' || c.tipo_empresa === filterTipo
    const matchesParceiro = filterParceiro === 'todos' || c.parceiro_id === filterParceiro

    let matchesDate = true
    if (startDate && endDate) {
      const cDate = new Date(c.created).getTime()
      const sDate = new Date(startDate).getTime()
      const eDate = new Date(endDate).getTime() + 86400000
      matchesDate = cDate >= sDate && cDate <= eDate
    } else if (startDate) {
      matchesDate = new Date(c.created).getTime() >= new Date(startDate).getTime()
    } else if (endDate) {
      matchesDate = new Date(c.created).getTime() <= new Date(endDate).getTime() + 86400000
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesOrigem &&
      matchesTipo &&
      matchesParceiro &&
      matchesDate
    )
  })

  if (adminLoading || loading)
    return (
      <div className="p-8">
        <Skeleton className="w-full h-96" />
      </div>
    )

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background">
      <Header title="Gestão de Clientes" />
      <div className="p-6 md:p-8 max-w-[1500px] mx-auto w-full pb-20 animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 w-fit px-0 hover:bg-transparent text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#002147]">Base de Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes da plataforma e aplique filtros detalhados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por Nome, CNPJ, Email..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterOrigem}
            onChange={(e) => setFilterOrigem(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled hidden>
              Selecione uma opção
            </option>
            <option value="todas">Todas Origens</option>
            <option value="parceiro">Parceiro</option>
            <option value="solicitar_diagnostico">Diagnóstico</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled hidden>
              Selecione uma opção
            </option>
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled hidden>
              Selecione uma opção
            </option>
            <option value="todos">Todos Tipos</option>
            <option value="inicial">Inicial</option>
            <option value="pequena">Pequena</option>
            <option value="media_grande">Média/Grande</option>
            <option value="Não definido">Não Definido</option>
          </select>
          <select
            value={filterParceiro}
            onChange={(e) => setFilterParceiro(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled hidden>
              Selecione uma opção
            </option>
            <option value="todos">Todos Parceiros</option>
            {parceiros.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_empresa}
              </option>
            ))}
          </select>
          <div className="flex gap-2 col-span-1 md:col-span-2 lg:col-span-1">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Data Inicial"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="Data Final"
            />
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email / Telefone</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Faturamento Anual</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum cliente encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClientes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.nome}</TableCell>
                        <TableCell>
                          <div className="text-sm">{c.email || '—'}</div>
                          <div className="text-xs text-muted-foreground">{c.telefone || '—'}</div>
                        </TableCell>
                        <TableCell>{c.cnpj || '—'}</TableCell>
                        <TableCell>
                          {c.faturamento_anual
                            ? new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(c.faturamento_anual)
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {c.origem?.replace('_', ' ') || 'Desconhecida'}
                          </Badge>
                          {c.expand?.parceiro_id && (
                            <div className="text-[10px] text-muted-foreground mt-1 truncate max-w-[120px]">
                              {c.expand.parceiro_id.nome_empresa}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={c.status === 'ativo' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {c.status || 'Ativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(c.created).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewClient(c)}
                              className="mr-2"
                            >
                              Abrir Formulário
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Editar"
                              onClick={() => setEditClient(c)}
                            >
                              <Edit className="w-4 h-4 text-[#C5A059]" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Definir Senha"
                              onClick={() => {
                                setSelectedClient(c)
                                setIsPasswordModalOpen(true)
                              }}
                            >
                              <Key className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title={c.status === 'ativo' ? 'Desativar' : 'Ativar'}
                              onClick={() => handleToggleStatus(c)}
                            >
                              {c.status === 'ativo' ? (
                                <ShieldOff className="w-4 h-4 text-amber-600" />
                              ) : (
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              title="Deletar"
                              onClick={() => setClientToDelete(c.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Deletar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Confirmar Deleção */}
        <AlertDialog
          open={!!clientToDelete}
          onOpenChange={(open) => !open && setClientToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Atenção</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar este cliente?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setClientToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (clientToDelete) {
                    handleDelete(clientToDelete)
                    setClientToDelete(null)
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal Definir Senha */}
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Definir Nova Senha</DialogTitle>
              <DialogDescription>
                Alterar a senha de acesso para o cliente <strong>{selectedClient?.nome}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSetPassword}
                className="bg-[#002147] hover:bg-[#002147]/90 text-white"
              >
                Salvar Senha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Ver Detalhes */}
        <Dialog open={!!viewClient} onOpenChange={(open) => !open && setViewClient(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-[#002147]">Detalhes do Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div className="col-span-2 md:col-span-1">
                <strong>Nome do Contato:</strong>{' '}
                {viewClient?.nome_responsavel || viewClient?.contato_nome || viewClient?.nome}
              </div>
              <div className="col-span-2 md:col-span-1">
                <strong>Email:</strong> {viewClient?.email || '—'}
              </div>
              <div className="col-span-2 md:col-span-1">
                <strong>Telefone:</strong> {viewClient?.telefone || '—'}
              </div>
              <div className="col-span-2 md:col-span-1">
                <strong>CNPJ / Razão Social:</strong> {viewClient?.cnpj || '—'}{' '}
                {viewClient?.razao_social ? `- ${viewClient.razao_social}` : ''}
              </div>
              <div className="col-span-2 md:col-span-1">
                <strong>Empresa:</strong> {viewClient?.nome}
              </div>
              <div className="col-span-2 md:col-span-1">
                <strong>Faturamento Anual:</strong>{' '}
                {viewClient?.faturamento_anual
                  ? new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(viewClient.faturamento_anual)
                  : '—'}
              </div>
              <div className="col-span-2 md:col-span-1">
                <strong>Ramo de Atividade:</strong> {viewClient?.ramo_atividade || '—'}
              </div>
              <div className="col-span-2 md:col-span-1">
                <strong>Prazo Desejado:</strong>{' '}
                {viewClient?.prazo_desejado?.replace('_', ' ') || '—'}
              </div>
              <div className="col-span-2 md:col-span-1 capitalize">
                <strong>Origem:</strong> {viewClient?.origem?.replace('_', ' ')}
              </div>
              <div className="col-span-2 md:col-span-1 capitalize">
                <strong>Status:</strong> {viewClient?.status}
              </div>
              <div className="col-span-2 md:col-span-1">
                <strong>Data de Cadastro:</strong>{' '}
                {viewClient && new Date(viewClient.created).toLocaleDateString('pt-BR')}
              </div>
              {viewClient?.expand?.parceiro_id && (
                <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border mt-2">
                  <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                    Parceiro Vinculado
                  </div>
                  <div className="font-medium text-[#002147] dark:text-[#C5A059]">
                    {viewClient.expand.parceiro_id.nome_empresa}
                  </div>
                  <div className="text-xs">{viewClient.expand.parceiro_id.email}</div>
                </div>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button
                onClick={() => setViewClient(null)}
                className="bg-[#002147] hover:bg-[#002147]/90 text-white w-full sm:w-auto"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Cliente */}
        <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[#002147]">Editar Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={editClient?.nome || ''}
                  onChange={(e) => setEditClient({ ...editClient, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editClient?.email || ''}
                  onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={editClient?.telefone || ''}
                    onChange={(e) => setEditClient({ ...editClient, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={editClient?.cnpj || ''}
                    onChange={(e) => setEditClient({ ...editClient, cnpj: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditClient(null)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-[#002147] hover:bg-[#002147]/90 text-white"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
