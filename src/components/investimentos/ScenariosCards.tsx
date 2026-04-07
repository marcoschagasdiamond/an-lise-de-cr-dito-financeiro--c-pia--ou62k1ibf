import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function ScenariosCards({ cenarios, setCenarios }: { cenarios: any; setCenarios: any }) {
  const update = (tipo: 'emprestimo' | 'investidor' | 'cotas', field: string, val: any) => {
    setCenarios((p: any) => ({
      ...p,
      [tipo]: { ...p[tipo], dados: { ...p[tipo].dados, [field]: val } },
    }))
  }

  const toggleAtivo = (tipo: 'emprestimo' | 'investidor' | 'cotas', ativo: boolean) => {
    setCenarios((p: any) => ({ ...p, [tipo]: { ...p[tipo], ativo } }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* Empréstimo */}
      <Card
        className={cn(
          'border-2 transition-all',
          cenarios.emprestimo.ativo ? 'border-[#002147] shadow-md' : 'border-transparent shadow-sm',
        )}
      >
        <CardHeader className="bg-slate-50/50 pb-4 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={cenarios.emprestimo.ativo}
              onCheckedChange={(c) => toggleAtivo('emprestimo', !!c)}
            />
            <Label className="font-bold text-[#002147]">Usar Empréstimo?</Label>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Banco</Label>
            <Input
              value={cenarios.emprestimo.dados.banco}
              onChange={(e) => update('emprestimo', 'banco', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              value={cenarios.emprestimo.dados.valor || ''}
              onChange={(e) => update('emprestimo', 'valor', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Taxa (% a.a.)</Label>
            <Input
              type="number"
              value={cenarios.emprestimo.dados.taxa_juros || ''}
              onChange={(e) => update('emprestimo', 'taxa_juros', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Prazo (meses)</Label>
            <Input
              type="number"
              value={cenarios.emprestimo.dados.prazo || ''}
              onChange={(e) => update('emprestimo', 'prazo', Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Investidor */}
      <Card
        className={cn(
          'border-2 transition-all',
          cenarios.investidor.ativo ? 'border-[#002147] shadow-md' : 'border-transparent shadow-sm',
        )}
      >
        <CardHeader className="bg-slate-50/50 pb-4 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={cenarios.investidor.ativo}
              onCheckedChange={(c) => toggleAtivo('investidor', !!c)}
            />
            <Label className="font-bold text-[#002147]">Usar Investidor?</Label>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={cenarios.investidor.dados.nome_investidor}
              onChange={(e) => update('investidor', 'nome_investidor', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Aporte (R$)</Label>
            <Input
              type="number"
              value={cenarios.investidor.dados.valor_aporte || ''}
              onChange={(e) => update('investidor', 'valor_aporte', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Participação (%)</Label>
            <Input
              type="number"
              value={cenarios.investidor.dados.participacao_acionaria || ''}
              onChange={(e) =>
                update('investidor', 'participacao_acionaria', Number(e.target.value))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Cotas */}
      <Card
        className={cn(
          'border-2 transition-all',
          cenarios.cotas.ativo ? 'border-[#002147] shadow-md' : 'border-transparent shadow-sm',
        )}
      >
        <CardHeader className="bg-slate-50/50 pb-4 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={cenarios.cotas.ativo}
              onCheckedChange={(c) => toggleAtivo('cotas', !!c)}
            />
            <Label className="font-bold text-[#002147]">Usar Cotas?</Label>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={cenarios.cotas.dados.tipo_cota}
              onValueChange={(v) => update('cotas', 'tipo_cota', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diamond">Diamond</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor Un. (R$)</Label>
            <Input
              type="number"
              value={cenarios.cotas.dados.valor_cota || ''}
              onChange={(e) => update('cotas', 'valor_cota', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Qtd.</Label>
            <Input
              type="number"
              value={cenarios.cotas.dados.quantidade || ''}
              onChange={(e) => update('cotas', 'quantidade', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Retorno (% a.a.)</Label>
            <Input
              type="number"
              value={cenarios.cotas.dados.retorno_esperado || ''}
              onChange={(e) => update('cotas', 'retorno_esperado', Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
