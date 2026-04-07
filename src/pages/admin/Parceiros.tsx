import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdmin } from '@/hooks/use-admin'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X, Building2, Edit2, ArrowLeft } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminParceiros() {
  const { isAdmin, hasPermission, loading: adminLoading } = useAdmin()
  const navigate = useNavigate()
  const [pendentes, setPendentes] = useState<any[]>([])
  const [ativos, setAtivos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [editandoParceiro, setEditandoParceiro] = useState<any>(null)
  const [novaComissao, setNovaComissao] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!adminLoading && !hasPermission('gerenciar_parceiros')) {
      toast.error('Acesso negado.')
      navigate('/admin/dashboard')
    }
  }, [adminLoading, hasPermission, navigate])

  const loadParceiros = async () => {
    try {
      const recordsPendentes = await pb.collection('parceiros').getFullList({
        filter: 'status = "pendente"',
        sort: '-created',
        expand: 'usuario_id',
      })
      setPendentes(recordsPendentes)

      const recordsAtivos = await pb.collection('parceiros').getFullList({
        filter: 'status = "aprovado"',
        sort: '-created',
        expand: 'usuario_id',
      })
      setAtivos(recordsAtivos)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar parceiros.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin && hasPermission('gerenciar_parceiros')) {
      loadParceiros()
    }
  }, [isAdmin, hasPermission])

  const handleAction = async (parceiro: any, action: 'aprovado' | 'rejeitado') => {
    try {
      const dataAprovacao = action === 'aprovado' ? new Date().toISOString() : undefined

      await pb.collection('parceiros').update(parceiro.id, {
        status: action,
        ...(dataAprovacao && { data_aprovacao: dataAprovacao }),
        aprovado_por: pb.authStore.record?.id,
      })

      if (parceiro.usuario_id) {
        await pb.collection('users').update(parceiro.usuario_id, {
          status: action === 'aprovado' ? 'ativo' : 'rejeitado',
        })
      }

      if (action === 'aprovado') {
        toast.success('Parceiro aprovado com sucesso!')
      } else {
        toast.success('Solicitação rejeitada.')
      }

      loadParceiros()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao processar ação.')
    }
  }

  const handleSaveCommission = async () => {
    if (!editandoParceiro || !novaComissao) return
    try {
      await pb.collection('parceiros').update(editandoParceiro.id, {
        percentual_comissao: parseFloat(novaComissao),
      })
      toast.success('Comissão atualizada com sucesso.')
      setIsDialogOpen(false)
      loadParceiros()
    } catch (error) {
      toast.error('Erro ao atualizar comissão.')
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
      <Header title="Gestão de Parceiros" />
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full pb-20 animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 w-fit px-0 hover:bg-transparent text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-bold text-[#002147]">Parceiros</h1>
          <p className="text-muted-foreground text-lg">
            Gerencie solicitações e taxas de comissão.
          </p>
        </div>

        <Tabs defaultValue="ativos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ativos">Parceiros Ativos</TabsTrigger>
            <TabsTrigger value="pendentes">
              Solicitações Pendentes
              {pendentes.length > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {pendentes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ativos">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Rede de Parceiros
                </CardTitle>
                <CardDescription>{ativos.length} parceiro(s) ativo(s).</CardDescription>
              </CardHeader>
              <CardContent>
                {ativos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhum parceiro ativo.
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Comissão (%)</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ativos.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.nome_empresa}</TableCell>
                            <TableCell>{p.email || p.expand?.usuario_id?.email || '—'}</TableCell>
                            <TableCell>
                              {p.percentual_comissao ? `${p.percentual_comissao}%` : '5%'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditandoParceiro(p)
                                  setNovaComissao((p.percentual_comissao || 5).toString())
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit2 className="w-4 h-4 mr-1" /> Editar Comissão
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pendentes">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Aguardando Aprovação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendentes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhuma solicitação pendente no momento.
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome da Empresa</TableHead>
                          <TableHead>CNPJ</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendentes.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium text-[#002147] dark:text-[#C5A059]">
                              {p.nome_empresa}
                            </TableCell>
                            <TableCell>{p.cnpj || '—'}</TableCell>
                            <TableCell>{p.email || p.expand?.usuario_id?.email || '—'}</TableCell>
                            <TableCell>{new Date(p.created).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAction(p, 'rejeitado')}
                                >
                                  <X className="w-4 h-4 mr-1" /> Rejeitar
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-[#C5A059] hover:bg-[#C5A059]/90 text-white"
                                  onClick={() => handleAction(p, 'aprovado')}
                                >
                                  <Check className="w-4 h-4 mr-1" /> Aprovar
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Comissão do Parceiro</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Taxa de Comissão (%)</Label>
              <Input
                type="number"
                value={novaComissao}
                onChange={(e) => setNovaComissao(e.target.value)}
                placeholder="Ex: 5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCommission}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
