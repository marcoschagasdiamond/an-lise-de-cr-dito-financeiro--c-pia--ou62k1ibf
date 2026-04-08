import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Calculator, DollarSign, Percent, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export default function Simulador() {
  const [amount, setAmount] = useState(10000)
  const [installments, setInstallments] = useState(12)
  const [interestRate, setInterestRate] = useState(1.99)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const calculateMonthlyPayment = () => {
    const principal = amount
    const rate = interestRate / 100
    if (rate === 0) return principal / installments
    return (
      (principal * rate * Math.pow(1 + rate, installments)) / (Math.pow(1 + rate, installments) - 1)
    )
  }

  const monthlyPayment = calculateMonthlyPayment()
  const totalPayment = monthlyPayment * installments
  const totalInterest = totalPayment - amount

  const handleSimulate = async () => {
    setIsSubmitting(true)
    try {
      // Registrar simulação para fins de demonstração (tabela pode não existir, falhará graciosamente)
      const { error } = await supabase.from('simulations').insert([
        {
          amount,
          installments,
          interest_rate: interestRate,
          monthly_payment: monthlyPayment,
          total_payment: totalPayment,
        },
      ])

      if (error && error.code !== '42P01') {
        // Ignorar se a tabela não existir
        console.error('Erro ao salvar simulação:', error)
      }

      toast({
        title: 'Simulação realizada',
        description: 'Sua simulação de crédito foi calculada com sucesso.',
      })
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível concluir a simulação.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Calculator className="h-8 w-8 text-primary" />
          Simulador de Crédito
        </h1>
        <p className="text-muted-foreground">
          Simule as condições do seu empréstimo e veja os detalhes das parcelas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros do Empréstimo</CardTitle>
            <CardDescription>Ajuste os valores para simular</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Valor Desejado
                </Label>
                <span className="font-semibold text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    amount,
                  )}
                </span>
              </div>
              <Slider
                id="amount"
                min={1000}
                max={100000}
                step={1000}
                value={[amount]}
                onValueChange={(val) => setAmount(val[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="installments" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Número de Parcelas
                </Label>
                <span className="font-semibold text-lg">{installments}x</span>
              </div>
              <Slider
                id="installments"
                min={6}
                max={48}
                step={6}
                value={[installments]}
                onValueChange={(val) => setInstallments(val[0])}
                className="py-4"
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="interestRate" className="flex items-center gap-2">
                <Percent className="h-4 w-4" /> Taxa de Juros (a.m.)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="interestRate"
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Resumo da Simulação</CardTitle>
            <CardDescription>Valores estimados baseados nas condições</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-background p-4 border shadow-sm flex flex-col items-center justify-center py-6">
              <span className="text-sm font-medium text-muted-foreground mb-1">
                Valor da Parcela
              </span>
              <span className="text-4xl font-bold text-primary">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  monthlyPayment,
                )}
              </span>
              <span className="text-sm text-muted-foreground mt-1">em {installments} vezes</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor Solicitado</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    amount,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Juros Totais</span>
                <span className="font-medium text-destructive">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    totalInterest,
                  )}
                </span>
              </div>
              <div className="pt-3 border-t flex justify-between font-semibold">
                <span>Custo Efetivo Total</span>
                <span>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    totalPayment,
                  )}
                </span>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              size="lg"
              onClick={handleSimulate}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Simulando...' : 'Aplicar Simulação'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
