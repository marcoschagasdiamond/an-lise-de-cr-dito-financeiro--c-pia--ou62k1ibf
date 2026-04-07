import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function MeusClientesAssistente() {
  const [vinculos, setVinculos] = useState<any[]>([])

  useEffect(() => {
    pb.collection('assistentes_clientes')
      .getFullList({ expand: 'projeto_id.cliente_id', sort: '-created' })
      .then(setVinculos)
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50 dark:bg-background">
      <Header title="Meus Clientes Atribuídos" />
      <div className="p-6 md:p-8 max-w-6xl mx-auto w-full pb-20">
        <h1 className="text-3xl font-bold text-primary mb-8">Clientes em Acompanhamento</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Projeto Fase</TableHead>
                  <TableHead>Status Vinculo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vinculos.map((v) => {
                  const proj = v.expand?.projeto_id
                  const cli = proj?.expand?.cliente_id
                  return (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{cli?.nome || '—'}</TableCell>
                      <TableCell>Fase {proj?.fase_atual || '1'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{v.status || 'Ativo'}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {vinculos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Nenhum cliente atribuído no momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
