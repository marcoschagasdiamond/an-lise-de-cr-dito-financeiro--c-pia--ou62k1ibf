import { useState, useEffect, Fragment } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { CalendarIcon, Bell, Check, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const routeNames: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  parceiros: 'Parceiros',
  administradores: 'Administradores',
  'consult-plan': 'Consult Plan',
  home: 'Home',
  funding: 'Funding',
  entregaveis: 'Entregáveis',
  beneficios: 'Benefícios',
  'solicitar-diagnostico': 'Diagnóstico',
  simuladores: 'Simuladores',
  'portal-cliente': 'Portal Cliente',
  'meu-projeto': 'Meu Projeto',
  'dashboard-executivo': 'Executivo',
  'analise-financeira': 'Análise',
  cenarios: 'Cenários',
  'analises-salvas': 'Salvas',
  'acompanhamento-desempenho': 'Desempenho',
  'simulador-financeiro': 'Simulador',
  'mapa-dividas': 'Dívidas',
  'historico-indexadores': 'Indexadores',
  'taxas-mercado': 'Taxas',
  'portal-parceiro': 'Portal Parceiro',
  'gestao-clientes': 'Clientes',
  'anexar-documentos': 'Documentos',
  'pipeline-demandas': 'Pipeline',
  'crm-parceiros': 'CRM',
  'gestao-pendencias': 'Pendências',
}

export function Header({ title }: { title: string }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const fetchNotifs = async () => {
      try {
        const records = await pb.collection('notificacoes').getList(1, 50, {
          sort: '-created',
          filter: `user_id = "${user.id}"`,
        })
        setNotifications(records.items)
      } catch (err) {
        console.error(err)
      }
    }
    fetchNotifs()
  }, [user])

  useRealtime(
    'notificacoes',
    (e) => {
      if (e.action === 'create') {
        setNotifications((prev) => [e.record, ...prev])
      } else if (e.action === 'update') {
        setNotifications((prev) => prev.map((n) => (n.id === e.record.id ? e.record : n)))
      } else if (e.action === 'delete') {
        setNotifications((prev) => prev.filter((n) => n.id !== e.record.id))
      }
    },
    !!user,
  )

  const markNotificationRead = async (id: string) => {
    try {
      await pb.collection('notificacoes').update(id, { lida: true })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.lida).length
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  return (
    <header className="flex min-h-16 py-2 shrink-0 items-center gap-3 border-b bg-white dark:bg-slate-950 px-6 shadow-sm z-10 sticky top-0">
      <SidebarTrigger className="-ml-2 text-slate-500 hover:text-[#C5A059]" />
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {paths.length > 0 && (
          <Breadcrumb className="hidden sm:flex mb-0.5">
            <BreadcrumbList className="text-xs">
              {paths.map((path, index) => {
                const isLast = index === paths.length - 1
                const name = routeNames[path] || path.charAt(0).toUpperCase() + path.slice(1)
                const to = `/${paths.slice(0, index + 1).join('/')}`

                return (
                  <Fragment key={to}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="font-semibold text-[#002147] dark:text-[#C5A059] truncate max-w-[150px]">
                          {name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link
                            to={to}
                            className="truncate max-w-[120px] hover:text-[#C5A059] transition-colors"
                          >
                            {name}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator className="w-3 h-3 opacity-50" />}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#002147] dark:text-slate-100 truncate leading-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 flex items-center justify-center text-[10px] bg-red-500 hover:bg-red-600 border-background border-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 shadow-lg border-border">
            <div className="p-3 border-b font-medium bg-muted/30">Notificações</div>
            <div className="max-h-80 overflow-y-auto flex flex-col">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Nenhuma notificação no momento.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'p-3 border-b last:border-0 text-sm flex gap-3 cursor-pointer hover:bg-muted/30 transition-colors',
                      !n.lida ? 'bg-primary/5' : '',
                    )}
                    onClick={() => !n.lida && markNotificationRead(n.id)}
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.tipo === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : n.tipo === 'success' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : n.tipo === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <p className={cn('leading-tight', !n.lida && 'font-semibold')}>
                        {n.mensagem}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          {formatDistanceToNow(new Date(n.created), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                        {n.link && (
                          <Link to={n.link} className="text-primary hover:underline">
                            Ver detalhes
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" className="hidden sm:flex text-muted-foreground gap-2">
          <CalendarIcon className="w-4 h-4" />
          <span>Período: Últimos 12 Meses</span>
        </Button>
      </div>
    </header>
  )
}
