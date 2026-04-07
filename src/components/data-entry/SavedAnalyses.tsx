import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Send, Download, Trash2, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useState } from 'react'

export function ReportPreviewDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Visualização do Relatório</DialogTitle>
          <DialogDescription>Pré-visualização do relatório financeiro final.</DialogDescription>
        </DialogHeader>
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-md min-h-[500px] flex items-center justify-center text-slate-500 shadow-inner">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p>O conteúdo completo do relatório gerado será exibido aqui.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SavedAnalyses() {
  const [previewOpen, setPreviewOpen] = useState(false)

  const files = Array.from({ length: 11 }).map((_, i) => ({
    id: i + 1,
    name: `Relatório de Análise Financeira ${i + 1}`,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString('pt-BR'),
    status: i < 3 ? 'Pendente' : 'Concluído',
  }))

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2e4a]">ANÁLISES SALVAS</h2>
          <p className="text-slate-500 mt-1">
            Gerencie seus arquivos de relatório de análise de crédito.
          </p>
        </div>
        <Button className="bg-[#0f2e4a] hover:bg-[#1a4b77] text-white shadow-md transition-colors">
          <Send className="w-4 h-4 mr-2" />
          Enviar para Análise
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-md transition-shadow border-slate-200 group">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center text-[#0f2e4a] leading-tight">
                <FileText className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
                <span className="truncate" title={file.name}>
                  {file.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-4">
                <span>{file.date}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-medium border ${file.status === 'Concluído' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                >
                  {file.status}
                </span>
              </div>
              <div className="flex gap-2 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Visualizar"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" title="Baixar">
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  )
}
