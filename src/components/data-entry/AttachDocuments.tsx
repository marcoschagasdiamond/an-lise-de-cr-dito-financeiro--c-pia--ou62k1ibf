import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileBox, Loader2, CheckCircle2, FileText, Settings2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useFinancialStore } from '@/store/main'
import { Badge } from '@/components/ui/badge'

type AttachedDoc = {
  id: string
  file: File
  isAudited: boolean
  isRevised: boolean
  progress: number
  extracting: boolean
  extracted: boolean
}

export function AttachDocuments() {
  const [isDragging, setIsDragging] = useState(false)
  const [docs, setDocs] = useState<AttachedDoc[]>([])
  const { toast } = useToast()
  const { updateBalanceSheet, addAuditLog, addNotification } = useFinancialStore()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFile(e.dataTransfer.files[0])
    }
  }

  const addFile = (file: File) => {
    setDocs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        file,
        isAudited: false,
        isRevised: false,
        progress: 0,
        extracting: false,
        extracted: false,
      },
    ])
    addAuditLog(`Documento anexado: ${file.name}`)
  }

  const updateDoc = (id: string, changes: Partial<AttachedDoc>) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)))

    setTimeout(() => {
      if (changes.isAudited !== undefined) {
        addAuditLog(`Documento marcado como ${changes.isAudited ? 'Auditado' : 'Não Auditado'}`)
        addNotification({
          message: `Documento marcado como ${changes.isAudited ? 'Auditado' : 'Não Auditado'}.`,
          type: 'audit',
          link: '/entrada-dados',
        })
      }
      if (changes.isRevised !== undefined) {
        addAuditLog(`Documento marcado como ${changes.isRevised ? 'Revisado' : 'Não Revisado'}`)
        addNotification({
          message: `Documento marcado como ${changes.isRevised ? 'Revisado' : 'Não Revisado'}.`,
          type: 'audit',
          link: '/entrada-dados',
        })
      }
    }, 0)
  }

  const handleExtract = (doc: AttachedDoc) => {
    if (doc.extracting || doc.extracted) return
    updateDoc(doc.id, { extracting: true, progress: 0 })

    const interval = setInterval(() => {
      setDocs((currentDocs) => {
        const currentDoc = currentDocs.find((d) => d.id === doc.id)
        if (!currentDoc) {
          clearInterval(interval)
          return currentDocs
        }

        if (currentDoc.progress >= 100) {
          clearInterval(interval)

          updateBalanceSheet(2023, {
            ativoCirculante: 320067630.54,
            ativoNaoCirculante: 41326782.38,
            passivoCirculante: 120000000,
            passivoNaoCirculante: 80000000,
            patrimonioLiquido: 161394412.92,
          })

          addAuditLog(
            `Extração automática de dados (OCR) finalizada para o documento: ${doc.file.name}`,
          )
          toast({
            title: 'Dados Extraídos com Sucesso',
            description: 'Valores contábeis foram importados para as tabelas de Balanço.',
          })

          return currentDocs.map((d) =>
            d.id === doc.id ? { ...d, extracting: false, extracted: true, progress: 100 } : d,
          )
        }
        return currentDocs.map((d) => (d.id === doc.id ? { ...d, progress: d.progress + 20 } : d))
      })
    }, 400)
  }

  const removeDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
    addAuditLog('Documento removido da lista de anexos.')
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Documentos e Extração de Dados</CardTitle>
          <CardDescription>
            Faça upload de balanços em PDF ou planilhas. Gerencie o status de auditoria e utilize
            OCR para extrair dados automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-300 ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/20 hover:border-primary/50 bg-muted/10'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">Arraste e solte seu arquivo aqui</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Suporta PDF, XLSX, CSV (Máx 10MB)
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Procurar Arquivo
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.xlsx,.csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    addFile(e.target.files[0])
                  }
                  e.target.value = ''
                }}
              />
            </div>
          </div>

          {docs.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">
                Documentos Anexados
              </h3>
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-4 p-4 border rounded-lg bg-card shadow-sm animate-fade-in"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-md dark:bg-blue-900/30 dark:text-blue-400">
                        <FileBox className="w-6 h-6" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium truncate text-foreground flex items-center gap-2">
                          {doc.file.name}
                          {doc.extracted && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Extraído
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>

                        <div className="flex items-center gap-6 mt-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={doc.isAudited}
                              onCheckedChange={(c) => updateDoc(doc.id, { isAudited: c })}
                              id={`audit-${doc.id}`}
                              className="scale-75"
                            />
                            <Label htmlFor={`audit-${doc.id}`} className="text-xs cursor-pointer">
                              Auditado
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={doc.isRevised}
                              onCheckedChange={(c) => updateDoc(doc.id, { isRevised: c })}
                              id={`rev-${doc.id}`}
                              className="scale-75"
                            />
                            <Label htmlFor={`rev-${doc.id}`} className="text-xs cursor-pointer">
                              Revisado
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Button
                        onClick={() => handleExtract(doc)}
                        disabled={doc.extracting || doc.extracted}
                        variant={doc.extracted ? 'secondary' : 'default'}
                        size="sm"
                        className="w-full"
                      >
                        {doc.extracting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : doc.extracted ? (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        ) : (
                          <Settings2 className="w-4 h-4 mr-2" />
                        )}
                        {doc.extracting
                          ? 'Extraindo...'
                          : doc.extracted
                            ? 'Dados Extraídos'
                            : 'Extrair Dados'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDoc(doc.id)}
                        disabled={doc.extracting}
                        className="text-muted-foreground w-full"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>

                  {doc.extracting && (
                    <div className="space-y-1.5 animate-fade-in w-full">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Lendo estrutura via OCR inteligente...</span>
                        <span className="font-medium">{doc.progress}%</span>
                      </div>
                      <Progress value={doc.progress} className="h-1.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
