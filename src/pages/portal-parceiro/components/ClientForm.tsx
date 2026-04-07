import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export function ClientForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cnpj: '',
    razao_social: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    cidade: '',
    estado: '',
    tipo_empresa: 'pequena',
    ramo_atividade: '',
    faturamento_estimado: '',
    contato_nome: '',
    contato_cargo: '',
    contato_email: '',
    contato_telefone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const cliente = await pb.collection('clientes').create({
        parceiro_id: user.id,
        ...formData,
        faturamento_estimado: Number(formData.faturamento_estimado) || 0,
        status: 'ativo',
      })
      await pb.collection('projetos').create({
        cliente_id: cliente.id,
        fase_atual: 1,
        data_inicio: new Date().toISOString(),
        tipo_empresa: formData.tipo_empresa,
      })
      toast.success('Cliente cadastrado com sucesso!')
      onClose()
    } catch (err) {
      toast.error('Erro ao cadastrar cliente. Verifique os dados.')
    }
    setLoading(false)
  }

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Cadastrar Novo Cliente</SheetTitle>
          <SheetDescription>
            Preencha os dados para iniciar o projeto e o acompanhamento das 9 fases.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="dados">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="dados">Básicos</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="negocio">Negócio</TabsTrigger>
            <TabsTrigger value="contatos">Contatos</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <TabsContent value="dados" className="space-y-4 animate-in fade-in-50">
              <div>
                <Label>Nome / Fantasia</Label>
                <Input name="nome" value={formData.nome} onChange={handleChange} />
              </div>
              <div>
                <Label>Razão Social</Label>
                <Input name="razao_social" value={formData.razao_social} onChange={handleChange} />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input name="cnpj" value={formData.cnpj} onChange={handleChange} />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input name="telefone" value={formData.telefone} onChange={handleChange} />
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-4 animate-in fade-in-50">
              <div>
                <Label>CEP</Label>
                <Input name="cep" value={formData.cep} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label>Logradouro</Label>
                  <Input name="logradouro" value={formData.logradouro} onChange={handleChange} />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input name="numero" value={formData.numero} onChange={handleChange} />
                </div>
              </div>
              <div>
                <Label>Complemento</Label>
                <Input name="complemento" value={formData.complemento} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cidade</Label>
                  <Input name="cidade" value={formData.cidade} onChange={handleChange} />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Input name="estado" value={formData.estado} onChange={handleChange} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="negocio" className="space-y-4 animate-in fade-in-50">
              <div>
                <Label>Porte da Empresa</Label>
                <select
                  value={formData.tipo_empresa}
                  onChange={(e) => handleSelectChange('tipo_empresa', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled hidden>
                    Selecione uma opção
                  </option>
                  <option value="inicial">Inicial (Startup)</option>
                  <option value="pequena">Pequena Empresa</option>
                  <option value="media_grande">Média/Grande Empresa</option>
                </select>
              </div>
              <div>
                <Label>Ramo de Atividade</Label>
                <Input
                  name="ramo_atividade"
                  value={formData.ramo_atividade}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Faturamento Estimado (Anual)</Label>
                <Input
                  name="faturamento_estimado"
                  type="number"
                  value={formData.faturamento_estimado}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>

            <TabsContent value="contatos" className="space-y-4 animate-in fade-in-50">
              <div>
                <Label>Nome do Responsável/Gerente</Label>
                <Input name="contato_nome" value={formData.contato_nome} onChange={handleChange} />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input
                  name="contato_cargo"
                  value={formData.contato_cargo}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>E-mail do Responsável</Label>
                <Input
                  name="contato_email"
                  type="email"
                  value={formData.contato_email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>Telefone do Responsável</Label>
                <Input
                  name="contato_telefone"
                  value={formData.contato_telefone}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-8 pt-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Cliente'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
