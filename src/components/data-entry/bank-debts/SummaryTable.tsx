import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function SummaryTable() {
  return (
    <div className="space-y-4 mt-8">
      <h4 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Resumo do Endividamento
      </h4>
      <div className="border rounded-lg overflow-hidden shadow-sm border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0f2e4a] hover:bg-[#0f2e4a] border-none">
              <TableHead className="text-white font-bold border-none">TIPO</TableHead>
              <TableHead className="text-white font-bold border-none text-right whitespace-nowrap px-2 text-xs">
                Saldo Devedor a Amortizar
              </TableHead>
              <TableHead className="text-white font-bold border-none text-right whitespace-nowrap px-2 text-xs">
                Juros Financeiros a Apropriar
              </TableHead>
              <TableHead className="text-white font-bold border-none text-right whitespace-nowrap px-2 text-xs">
                Amortização Principal Próxima Prestação
              </TableHead>
              <TableHead className="text-white font-bold border-none text-right whitespace-nowrap px-2 text-xs">
                Pagamento Juros Próxima Prestação
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-slate-50 border-b border-slate-100">
              <TableCell className="font-medium text-slate-700">Sem Amortização</TableCell>
              <TableCell className="text-right font-medium">0,00</TableCell>
              <TableCell className="text-right font-medium">0,00</TableCell>
              <TableCell className="text-right font-medium">0,00</TableCell>
              <TableCell className="text-right font-medium">0,00</TableCell>
            </TableRow>
            <TableRow className="hover:bg-slate-50 border-b border-slate-100">
              <TableCell className="font-medium text-slate-700">Com Amortização</TableCell>
              <TableCell className="text-right font-medium">0,00</TableCell>
              <TableCell className="text-right font-medium">0,00</TableCell>
              <TableCell className="text-right font-medium">0,00</TableCell>
              <TableCell className="text-right font-medium">0,00</TableCell>
            </TableRow>
            <TableRow className="bg-slate-50 font-bold hover:bg-slate-50 border-t-2 border-slate-200">
              <TableCell className="text-[#0f2e4a]">TOTAL GERAL</TableCell>
              <TableCell className="text-right text-[#0f2e4a]">0,00</TableCell>
              <TableCell className="text-right text-[#0f2e4a]">0,00</TableCell>
              <TableCell className="text-right text-[#0f2e4a]">0,00</TableCell>
              <TableCell className="text-right text-[#0f2e4a]">0,00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
