import { CapitalStructureTable } from './CapitalStructureTable'
import { InstituicaoFinanceiraTable } from './InstituicaoFinanceiraTable'
import { LiquidezTable } from './LiquidezTable'
import { CapitalGiroTable } from './CapitalGiroTable'
import { CicloOperacionalTable } from './CicloOperacionalTable'
import { RentabilidadeTable } from './RentabilidadeTable'
import { Separator } from '@/components/ui/separator'

export function FinancialIndicators() {
  return (
    <div className="space-y-12 pb-10 animate-in fade-in-50 duration-500">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Análise Econômico-Financeira</h2>
        <p className="text-muted-foreground">
          Preencha os indicadores detalhados para empresas de Médio e Grande Porte.
        </p>
      </div>

      <div className="space-y-12">
        <section className="flex flex-col w-full max-w-5xl mx-auto shadow-md rounded-md overflow-hidden border border-slate-300">
          <div className="bg-[#1f497d] text-white font-extrabold text-center py-2 text-lg uppercase tracking-wide border-b-2 border-[#1f497d]">
            Indicadores Econômico-Financeiros
          </div>
          <div className="bg-[#c5d9f1] w-full p-6 sm:px-8 flex flex-col gap-10">
            <CicloOperacionalTable />
            <RentabilidadeTable />
          </div>
        </section>

        <Separator className="my-8" />

        <section className="flex flex-col gap-8 justify-center w-full max-w-5xl mx-auto">
          <LiquidezTable />
          <CapitalGiroTable />
        </section>

        <Separator className="my-8" />

        <section className="flex justify-center w-full">
          <CapitalStructureTable />
        </section>

        <Separator className="my-8" />

        <section className="flex justify-center w-full">
          <InstituicaoFinanceiraTable />
        </section>
      </div>
    </div>
  )
}
