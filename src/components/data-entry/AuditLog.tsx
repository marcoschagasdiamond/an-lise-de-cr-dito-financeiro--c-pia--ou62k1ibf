import { useFinancialStore } from '@/store/main'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History } from 'lucide-react'

export function AuditLog() {
  const { auditLogs } = useFinancialStore()

  if (!auditLogs || auditLogs.length === 0) return null

  return (
    <Card className="mt-12 print:hidden shadow-sm border-muted">
      <CardHeader className="bg-muted/30 pb-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> Histórico de Alterações (Trilha de Auditoria)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px] w-full">
          <div className="p-4 space-y-4">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="flex gap-4 items-start text-sm border-b last:border-0 pb-3 last:pb-0"
              >
                <span className="text-muted-foreground whitespace-nowrap font-mono text-xs mt-0.5">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </span>
                <span className="text-foreground">{log.description}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
