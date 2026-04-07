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
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

export function NewDocumentDialog({ projetoId }: { projetoId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({ tipo: 'proposta', nome: '', descricao: '' })
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return toast.error('Selecione um arquivo')
    try {
      const data = new FormData()
      data.append('projeto_id', projetoId)
      data.append('tipo', formData.tipo)
      data.append('nome', formData.nome)
      data.append('descricao', formData.descricao)
      data.append('versao', '1')
      data.append('status', 'rascunho')
      data.append('arquivo', file)

      await pb.collection('documentos_projeto').create(data)
      setIsOpen(false)
      setFormData({ tipo: 'proposta', nome: '', descricao: '' })
      setFile(null)
      toast.success('Documento adicionado!')
    } catch (err) {
      toast.error('Erro ao adicionar documento')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Upload className="w-4 h-4 mr-2" /> Upload de Novo Documento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Documento</DialogTitle>
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
            <label className="text-sm font-medium">Arquivo (v1)</label>
            <Input type="file" required onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <Button type="submit" className="w-full">
            Salvar Documento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
