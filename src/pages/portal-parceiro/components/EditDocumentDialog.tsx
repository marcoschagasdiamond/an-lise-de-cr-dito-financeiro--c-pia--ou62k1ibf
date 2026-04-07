import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Edit2 } from 'lucide-react'
import { toast } from 'sonner'

export function EditDocumentDialog({
  doc,
  projetoId,
  onUpdate,
}: {
  doc: any
  projetoId: string
  onUpdate?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    tipo: doc.tipo,
    nome: doc.nome,
    descricao: doc.descricao || '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const recordsToUpdate = await pb.collection('documentos_projeto').getFullList({
        filter: `projeto_id = "${projetoId}" && nome = "${doc.nome}" && tipo = "${doc.tipo}"`,
      })

      if (file) {
        if (formData.nome !== doc.nome || formData.tipo !== doc.tipo) {
          for (const record of recordsToUpdate) {
            await pb.collection('documentos_projeto').update(record.id, {
              nome: formData.nome,
              tipo: formData.tipo,
            })
          }
        }

        const data = new FormData()
        data.append('projeto_id', projetoId)
        data.append('tipo', formData.tipo)
        data.append('nome', formData.nome)
        data.append('descricao', formData.descricao)
        data.append('versao', String(doc.versao + 1))
        data.append('status', 'em_revisao')
        data.append('arquivo', file)

        await pb.collection('documentos_projeto').create(data)
        toast.success('Nova versão criada com sucesso!')
      } else {
        for (const record of recordsToUpdate) {
          if (record.id === doc.id) {
            await pb.collection('documentos_projeto').update(record.id, {
              tipo: formData.tipo,
              nome: formData.nome,
              descricao: formData.descricao,
            })
          } else if (formData.nome !== doc.nome || formData.tipo !== doc.tipo) {
            await pb.collection('documentos_projeto').update(record.id, {
              tipo: formData.tipo,
              nome: formData.nome,
            })
          }
        }
        toast.success('Documento atualizado com sucesso!')
      }
      setIsOpen(false)
      setFile(null)
      if (onUpdate) onUpdate()
    } catch (err) {
      toast.error('Erro ao atualizar documento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (open) {
          setFormData({ tipo: doc.tipo, nome: doc.nome, descricao: doc.descricao || '' })
          setFile(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Editar Documento">
          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Documento (v{doc.versao})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={formData.tipo}
              onValueChange={(v) => setFormData({ ...formData, tipo: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proposta">Proposta</SelectItem>
                <SelectItem value="analise_financeira">Análise Financeira</SelectItem>
                <SelectItem value="fluxo_caixa">Fluxo de Caixa</SelectItem>
                <SelectItem value="estruturacao">Estruturação</SelectItem>
                <SelectItem value="outra">Outra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome do Documento</label>
            <Input
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Novo Arquivo (Opcional - Cria Nova Versão)
            </label>
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
