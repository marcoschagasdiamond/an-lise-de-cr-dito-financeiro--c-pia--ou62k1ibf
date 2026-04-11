import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, UserCog, Mail, ShieldCheck, LifeBuoy, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function Administradores() {
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState<any[]>([])

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)

  const [newAdmin, setNewAdmin] = useState({ nome: '', email: '', password: '' })
  const [editAdmin, setEditAdmin] = useState({
    id: '',
    usuario_id: '',
    nome: '',
    email: '',
    password: '',
  })

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('administradores')
        .select(`
          id,
          nome,
          email,
          status,
          usuario_id,
          data_criacao,
          usuarios ( email, status )
        `)
        .order('data_criacao', { ascending: true })

      if (error) throw error

      if (data) {
        const formatted = data.map((a) => ({
          id: a.id,
          nome: a.nome || 'Admin',
          email: a.email || (a.usuarios as any)?.email || 'Sem email',
          status: a.status || (a.usuarios as any)?.status || 'ativo',
          usuario_id: a.usuario_id,
        }))
        setAdmins(formatted)
      }
    } catch (err) {
      console.error('Error fetching admins:', err)
      toast.error('Erro ao carregar administradores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction(true)
    try {
      let userId = null

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            name: newAdmin.nome,
            tipo_usuario: 'admin',
          },
        },
      })

      if (!authError && authData?.user) {
        userId = authData.user.id
      }

      const { error: adminError } = await supabase.from('administradores').insert({
        usuario_id: userId,
        nome: newAdmin.nome,
        email: newAdmin.email,
        permissoes: { todas: true },
        status: 'ativo',
      })

      if (adminError) throw adminError

      toast.success('Administrador inserido com sucesso!')
      setIsAddModalOpen(false)
      setNewAdmin({ nome: '', email: '', password: '' })
      fetchAdmins()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao inserir administrador')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction(true)
    try {
      const { error: adminError } = await supabase
        .from('administradores')
        .update({ nome: editAdmin.nome, email: editAdmin.email })
        .eq('id', editAdmin.id)

      if (adminError) throw adminError

      if (editAdmin.usuario_id) {
        const updateData: any = { nome: editAdmin.nome, email: editAdmin.email }
        if (editAdmin.password) updateData.senha_hash = editAdmin.password

        await supabase.from('usuarios').update(updateData).eq('id', editAdmin.usuario_id)
      }

      toast.success('Administrador atualizado com sucesso!')
      setIsEditModalOpen(false)
      fetchAdmins()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao atualizar administrador')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (
      !confirm(
        'Tem certeza que deseja deletar este administrador? Essa ação não pode ser desfeita.',
      )
    )
      return

    try {
      const { error: adminError } = await supabase
        .from('administradores')
        .delete()
        .eq('id', adminId)
      if (adminError) throw adminError

      toast.success('Administrador deletado com sucesso!')
      fetchAdmins()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao deletar administrador')
    }
  }

  const openEditModal = (admin: any) => {
    setEditAdmin({
      id: admin.id,
      usuario_id: admin.usuario_id,
      nome: admin.nome,
      email: admin.email,
      password: '',
    })
    setIsEditModalOpen(true)
  }

  const mainAdmin = admins.find((a) => a.email === 'marcoschagasdiamond@icloud.com') ||
    admins[0] || {
      id: 'placeholder',
      nome: 'Administrador Principal',
      email: 'marcoschagasdiamond@icloud.com',
      status: 'ativo',
    }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f2e4a] dark:text-slate-100">Administradores</h1>
          <p className="text-slate-500 mt-1">
            Gerencie os usuários com acesso administrativo ao sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-xl text-[#0f2e4a] dark:text-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  Admin Principal
                </div>
                {mainAdmin.id !== 'placeholder' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(mainAdmin)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        onClick={() => handleDeleteAdmin(mainAdmin.id)}
                      >
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <p className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                  {mainAdmin.nome}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{mainAdmin.email}</span>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                >
                  {mainAdmin.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full bg-[#0f2e4a] hover:bg-[#0f2e4a]/90 text-white h-12"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Inserir novo administrador
          </Button>

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-xl text-[#0f2e4a] dark:text-slate-100 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-600" />
                Suporte Técnico
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Precisa de ajuda com o painel? Entre em contato com nossa equipe técnica para
                suporte especializado.
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-100 dark:border-slate-800">
                <Mail className="w-4 h-4 text-blue-600" />
                fabiane.z@dgroup.com.br
              </div>
              <Button className="w-full" variant="outline" asChild>
                <a href="mailto:fabiane.z@dgroup.com.br">Enviar Email</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm h-full">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
              <CardTitle className="text-xl text-[#0f2e4a] dark:text-slate-100 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-blue-600" />
                Equipe Administrativa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                      <TableHead className="font-semibold">Nome</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold text-center">Status</TableHead>
                      <TableHead className="font-semibold text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-slate-500">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Carregando administradores...
                        </TableCell>
                      </TableRow>
                    ) : admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                          Nenhum administrador encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow
                          key={admin.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <TableCell className="font-medium">{admin.nome}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Mail className="w-3 h-3" />
                              {admin.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {admin.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditModal(admin)}>
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                >
                                  Deletar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inserir Novo Administrador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                required
                value={newAdmin.nome}
                onChange={(e) => setNewAdmin({ ...newAdmin, nome: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                placeholder="admin@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                required
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                placeholder="Senha de acesso"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0f2e4a] text-white" disabled={loadingAction}>
                {loadingAction ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Administrador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAdmin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome Completo</Label>
              <Input
                id="edit-nome"
                required
                value={editAdmin.nome}
                onChange={(e) => setEditAdmin({ ...editAdmin, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={editAdmin.email}
                onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-senha">Nova Senha (opcional)</Label>
              <Input
                id="edit-senha"
                type="password"
                value={editAdmin.password}
                onChange={(e) => setEditAdmin({ ...editAdmin, password: e.target.value })}
                placeholder="Deixe em branco para manter a atual"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#0f2e4a] text-white" disabled={loadingAction}>
                {loadingAction ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
