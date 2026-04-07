import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, History, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import pb from '@/lib/pocketbase/client'
import { DocumentComments } from './DocumentComments'

interface Props {
  group: any[] | null
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedVersion: any | null
  setSelectedVersion: (doc: any) => void
}

export function DocumentHistorySheet({
  group,
  open,
  onOpenChange,
  selectedVersion,
  setSelectedVersion,
}: Props) {
  if (!group || group.length === 0) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto border-l">
        <SheetHeader className="mb-6">
          <SheetTitle>Detalhes do Documento</SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg">{group[0].nome}</h4>
            <p className="text-sm text-muted-foreground capitalize">
              {group[0].tipo.replace('_', ' ')}
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium flex items-center gap-2 text-primary">
              <History className="w-4 h-4" /> Histórico de Versões
            </h5>
            <div className="border rounded-md divide-y bg-card">
              {group.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedVersion?.id === doc.id ? 'bg-muted/80 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => setSelectedVersion(doc)}
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <span>Versão {doc.versao}</span>
                      {doc.id === selectedVersion?.id && (
                        <Badge variant="secondary" className="text-[10px]">
                          Selecionada
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(doc.updated), 'dd/MM/yyyy HH:mm')} •{' '}
                      {doc.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  {doc.arquivo && (
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={pb.files.getUrl(doc, doc.arquivo)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedVersion && (
            <div className="pt-4 border-t">
              <h5 className="font-medium flex items-center gap-2 mb-4 text-primary">
                <MessageSquare className="w-4 h-4" /> Revisão e Comentários (v
                {selectedVersion.versao})
              </h5>
              <DocumentComments documentoId={selectedVersion.id} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
