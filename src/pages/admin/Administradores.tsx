import { useEffect, useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useAdmin } from '@/hooks/use-admin'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { UserPlus, Trash2, ShieldCheck, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminAdministradores() {
  const { isAdmin, hasPermission, loading: adminLoading } = useAdmin()
  const navigate = useNavigate()
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    perms: {
      gerenciar_parceiros: false,
      gerenciar_clientes: false,
      gerenciar_admins: false,
    },
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!adminLoading && !hasPermission('gerenciar_admins')) {
      toast.error('Acesso negado.')
      navigate('/admin/dashboard')
    }
  }, [adminLoading, hasPermission, navigate])

  const loadAdmins = async () => {
    try {
      const records = await pb.collection('administradores').getFullList({
        sort: '-created',
        expand: 'usuario_id',
      })
      setAdmins(records)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar administradores.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin && hasPermission('gerenciar_admins')) {
      loadAdmins()
    }
  }, [isAdmin, hasPermission])

  const handleCreateAdmin = async () => {
    if (!formData.nome || !formData.email || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    if (formData.password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setSubmitting(true)
    try {
      const userRecord = await pb.collection('users').create({
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.password,
        name: formData.nome,
        role: 'administrador',
        status: 'ativo',
      })

      const permissoes = Object.entries(formData.perms)
        .filter(([_, value]) => value)
        .map(([key]) => key)

      await pb.collection('administradores').create({
        usuario_id: userRecord.id,
        nome: formData.nome,
        email: formData.email,
        permissoes,
      })

      toast.success('Administrador cadastrado com sucesso!')
      setIsModalOpen(false)
      setFormData({
        nome: '',
        email: '',
        password: '',
        perms: { gerenciar_parceiros: false, gerenciar_clientes: false, gerenciar_admins: false },
      })
      loadAdmins()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.message || 'Erro ao cadastrar administrador.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, userId: string) => {
    if (!confirm('Tem certeza que deseja remover este administrador? O acesso dele será revogado.'))
      return
    try {
      await pb.collection('administradores').delete(id)
      await pb.collection('users').delete(userId)
      toast.success('Administrador removido.')
      loadAdmins()
    } catch (err) {
      toast.error('Erro ao remover administrador.')
    }
  }

  if (adminLoading || loading)
    return (
      <div className="p-8">
        <Skeleton className="w-full h-96" />
      </div>
    )

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background">
      <Header title="Gestão de Administradores" />
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full pb-20 animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 w-fit px-0 hover:bg-transparent text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#002147]">Administradores do Sistema</h1>
            <p className="text-muted-foreground">Controle quem tem acesso total à plataforma.</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-[#002147] hover:bg-[#002147]/90 text-white"
          >
            <UserPlus className="w-4 h-4" /> Novo Administrador
          </Button>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum administrador encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    admins.map((adm) => (
                      <TableRow key={adm.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#002147]" />
                            {adm.nome}
                          </div>
                        </TableCell>
                        <TableCell>{adm.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {adm.permissoes?.map((p: string) => (
                              <Badge key={p} variant="secondary" className="text-[10px]">
                                {p.replace('gerenciar_', '')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(adm.created).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-right">
                          {pb.authStore.record?.id !== adm.usuario_id && (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Remover"
                              onClick={() => handleDelete(adm.id, adm.usuario_id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Administrador</DialogTitle>
              <DialogDescription>
                Crie um novo usuário com acesso administrativo à plataforma.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Ana Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ana@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Senha Temporária</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="space-y-3 pt-2">
                <Label>Permissões de Acesso</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm_parceiros"
                    checked={formData.perms.gerenciar_parceiros}
                    onCheckedChange={(c) =>
                      setFormData({
                        ...formData,
                        perms: { ...formData.perms, gerenciar_parceiros: c === true },
                      })
                    }
                  />
                  <label htmlFor="perm_parceiros" className="text-sm font-medium leading-none">
                    Aprovar e gerenciar parceiros
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm_clientes"
                    checked={formData.perms.gerenciar_clientes}
                    onCheckedChange={(c) =>
                      setFormData({
                        ...formData,
                        perms: { ...formData.perms, gerenciar_clientes: c === true },
                      })
                    }
                  />
                  <label htmlFor="perm_clientes" className="text-sm font-medium leading-none">
                    Visualizar e gerenciar clientes
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm_admins"
                    checked={formData.perms.gerenciar_admins}
                    onCheckedChange={(c) =>
                      setFormData({
                        ...formData,
                        perms: { ...formData.perms, gerenciar_admins: c === true },
                      })
                    }
                  />
                  <label htmlFor="perm_admins" className="text-sm font-medium leading-none">
                    Cadastrar e remover administradores
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateAdmin}
                disabled={submitting}
                className="bg-[#002147] hover:bg-[#002147]/90 text-white"
              >
                {submitting ? 'Salvando...' : 'Cadastrar Adm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
