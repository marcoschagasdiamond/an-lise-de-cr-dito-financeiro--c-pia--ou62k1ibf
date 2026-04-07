import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

export function NotificationsPanel() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState<any[]>([])

  const loadNotifs = async () => {
    if (!user) return
    try {
      const res = await pb.collection('notificacoes').getList(1, 30, {
        filter: `user_id = "${user.id}"`,
        sort: '-created',
      })
      setNotifs(res.items)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadNotifs()
  }, [user])
  useRealtime('notificacoes', () => loadNotifs())

  return (
    <div className="h-full flex flex-col border-l bg-card text-card-foreground shadow-sm">
      <div className="p-5 border-b flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-bold text-lg">Notificações</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-lg border text-sm transition-all hover:shadow-sm ${n.lida ? 'opacity-70 bg-muted/30' : 'bg-background shadow-sm border-l-4'} ${n.tipo === 'success' ? 'border-l-green-500' : n.tipo === 'warning' ? 'border-l-yellow-500' : n.tipo === 'error' ? 'border-l-red-500' : 'border-l-blue-500'}`}
          >
            <div className="flex items-start gap-3">
              {n.tipo === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              )}
              {n.tipo === 'warning' && (
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
              )}
              {n.tipo === 'error' && (
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              )}
              {n.tipo === 'info' && <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />}

              <div className="flex-1">
                <p className="font-medium text-foreground leading-tight">{n.mensagem}</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">
                  {formatDistanceToNow(new Date(n.created), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {notifs.length === 0 && (
          <div className="text-center py-10 opacity-60">
            <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Sem novas notificações.</p>
          </div>
        )}
      </div>
    </div>
  )
}
