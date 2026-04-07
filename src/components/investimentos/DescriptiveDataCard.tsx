import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function DescriptiveDataCard({ plano, setPlano }: { plano: any; setPlano: any }) {
  return (
    <Card className="h-full border-[#1A3A5F]/20 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-[#002147]">Dados Descritivos</CardTitle>
        <CardDescription>Informações para a apresentação</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Nome do Projeto</Label>
          <Input
            value={plano.nome_projeto}
            onChange={(e) => setPlano({ ...plano, nome_projeto: e.target.value })}
            placeholder="Ex: Expansão Fabril 2026"
          />
        </div>
        <div className="space-y-2">
          <Label>Apresentação da Empresa</Label>
          <Textarea
            value={plano.apresentacao_empresa}
            onChange={(e) => setPlano({ ...plano, apresentacao_empresa: e.target.value })}
            className="min-h-[100px]"
            placeholder="Breve histórico..."
          />
        </div>
        <div className="space-y-2">
          <Label>Apresentação do Projeto</Label>
          <Textarea
            value={plano.apresentacao_projeto}
            onChange={(e) => setPlano({ ...plano, apresentacao_projeto: e.target.value })}
            className="min-h-[100px]"
            placeholder="Objetivos e escopo..."
          />
        </div>
        <div className="space-y-2">
          <Label>Mercado e Justificativa</Label>
          <Textarea
            value={plano.mercado_justificativa}
            onChange={(e) => setPlano({ ...plano, mercado_justificativa: e.target.value })}
            className="min-h-[100px]"
            placeholder="Oportunidade..."
          />
        </div>
      </CardContent>
    </Card>
  )
}
