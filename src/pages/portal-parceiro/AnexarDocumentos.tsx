import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UploadCloud, FileText } from 'lucide-react'

export default function AnexarDocumentos() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50/50">
      <Header title="Anexar Documentos" />
      <div className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-6 animate-fade-in-up">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Upload de Documentos do Cliente</CardTitle>
            <CardDescription>
              Selecione o cliente e anexe os arquivos financeiros, jurídicos ou de compliance
              necessários.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Cliente Referência</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="c1">Empresa Alpha S/A</SelectItem>
                  <SelectItem value="c2">Beta Indústria e Comércio</SelectItem>
                  <SelectItem value="c3">Gamma Tech Solutions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Tipo de Documento</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanco">Balanço Patrimonial</SelectItem>
                  <SelectItem value="dre">DRE</SelectItem>
                  <SelectItem value="contrato">Contrato Social / Estatuto</SelectItem>
                  <SelectItem value="endividamento">Planilha de Endividamento</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Anexar Arquivos</label>
              <div
                className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-colors group"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <p className="font-semibold text-lg">
                  Clique para selecionar ou arraste arquivos aqui
                </p>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Formatos suportados: PDF, DOCX, XLSX, JPG, PNG (Tamanho máximo: 10MB por arquivo)
                </p>
                <Input type="file" className="hidden" multiple id="file-upload" />
                <Button variant="secondary" className="mt-6 pointer-events-none">
                  Explorar Arquivos
                </Button>
              </div>
            </div>

            <Button className="w-full h-12 text-md font-semibold">Finalizar Upload</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Uploads Recentes
          </h3>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Balanco_Patrimonial_2023.pdf</p>
                        <p className="text-xs text-muted-foreground">
                          Empresa Alpha S/A • Hoje, 14:3{i}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      Concluído
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
