import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calculator } from 'lucide-react'

export function DREParamsCard({ plano, setPlano }: { plano: any; setPlano: any }) {
  const [localConfig, setLocalConfig] = useState(plano.config_dre)

  useEffect(() => {
    setLocalConfig(plano.config_dre)
  }, [plano.config_dre])

  const updateConfig = (field: string, val: number) => {
    setLocalConfig({ ...localConfig, [field]: val })
  }

  const handleCalculate = () => {
    setPlano({ ...plano, config_dre: localConfig })
  }

  return (
    <Card className="border-[#1A3A5F]/20 shadow-sm mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-[#002147]">Parâmetros da Projeção DRE</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Receita Operacional Bruta Ano 1 (R$)</Label>
            <Input
              type="number"
              value={localConfig?.receitaAno1 || ''}
              onChange={(e) => updateConfig('receitaAno1', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Crescimento Anual da Receita (%)</Label>
            <Input
              type="number"
              value={localConfig?.crescimentoAnual || ''}
              onChange={(e) => updateConfig('crescimentoAnual', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Margem de Deduções (%)</Label>
            <Input
              type="number"
              value={localConfig?.margemDeducoes !== undefined ? localConfig.margemDeducoes : ''}
              onChange={(e) => updateConfig('margemDeducoes', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Margem de Custos das Vendas (%)</Label>
            <Input
              type="number"
              value={localConfig?.margemCusto !== undefined ? localConfig.margemCusto : ''}
              onChange={(e) => updateConfig('margemCusto', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Margem de Despesas Operacionais (%)</Label>
            <Input
              type="number"
              value={
                localConfig?.margemDespesasOp !== undefined ? localConfig.margemDespesasOp : ''
              }
              onChange={(e) => updateConfig('margemDespesasOp', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Margem de Despesas Financeiras (%)</Label>
            <Input
              type="number"
              value={
                localConfig?.margemDespesasFin !== undefined ? localConfig.margemDespesasFin : ''
              }
              onChange={(e) => updateConfig('margemDespesasFin', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Alíquota IR e CSLL (%)</Label>
            <Input
              type="number"
              value={localConfig?.aliquotaIRCSLL !== undefined ? localConfig.aliquotaIRCSLL : ''}
              onChange={(e) => updateConfig('aliquotaIRCSLL', Number(e.target.value))}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleCalculate} className="bg-[#002147] hover:bg-[#00122e] text-white">
            <Calculator className="w-4 h-4 mr-2" />
            Calcular Projeção
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
