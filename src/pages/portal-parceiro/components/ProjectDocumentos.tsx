import { useState, useEffect, useMemo } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Check, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { NewDocumentDialog } from './NewDocumentDialog'
import { DocumentHistorySheet } from './DocumentHistorySheet'
import { EditDocumentDialog } from './EditDocumentDialog'

export function ProjectDocumentos({
  projetoId,
  isPartner = true,
}: {
  projetoId: string
  isPartner?: boolean
}) {
  const [documentos, setDocumentos] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState<any[] | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null)

  const loadData = async () => {
    try {
      const records = await pb.collection('documentos_projeto').getFullList({
        filter: `projeto_id = "${projetoId}"`,
        sort: '-created',
      })
      setDocumentos(records)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [projetoId])
  useRealtime('documentos_projeto', loadData)

  const docGroups = useMemo(() => {
    const groups = new Map<string, any[]>()
    documentos.forEach((doc) => {
      const key = `${doc.tipo}-${doc.nome}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(doc)
    })
    return Array.from(groups.values()).map((group) => group.sort((a, b) => b.versao - a.versao))
  }, [documentos])

  const approveDocument = async (id: string) => {
    try {
      await pb.collection('documentos_projeto').update(id, { status: 'aprovado' })
      toast.success('Documento aprovado!')
    } catch (err) {
      toast.error('Erro ao aprovar documento')
    }
  }

  const openDetails = (group: any[]) => {
    setSelectedGroup(group)
    setSelectedVersion(group[0])
  }

  const getStatusColor = (status: string) => {
    if (status === 'aprovado') return 'bg-green-500 hover:bg-green-600'
    if (status === 'em_revisao') return 'bg-blue-500 hover:bg-blue-600 text-white'
    return 'bg-yellow-500 hover:bg-yellow-600 text-white'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> DESENVOLVIMENTO DO PROJETO (Fase 8)
        </h3>
        {isPartner && <NewDocumentDialog projetoId={projetoId} />}
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Versão Atual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docGroups.map((group) => {
              const doc = group[0]
              return (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" /> {doc.nome}
                  </TableCell>
                  <TableCell className="capitalize">{doc.tipo.replace('_', ' ')}</TableCell>
                  <TableCell className="text-center font-medium">v{doc.versao}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(doc.updated), 'dd/MM/yy HH:mm')}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetails(group)}
                      title="Ver Detalhes e Comentários"
                    >
                      <Eye className="w-4 h-4 text-primary" />
                    </Button>
                    {isPartner && (
                      <>
                        <EditDocumentDialog doc={doc} projetoId={projetoId} />
                        {doc.status !== 'aprovado' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => approveDocument(doc.id)}
                            title="Marcar como Aprovado"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {docGroups.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum documento encontrado para este projeto.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentHistorySheet
        group={selectedGroup}
        open={!!selectedGroup}
        onOpenChange={(open: boolean) => !open && setSelectedGroup(null)}
        selectedVersion={selectedVersion}
        setSelectedVersion={setSelectedVersion}
      />
    </div>
  )
}
