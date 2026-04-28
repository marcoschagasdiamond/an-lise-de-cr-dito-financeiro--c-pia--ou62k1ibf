import { Link, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Home,
  CircleDollarSign,
  PackageCheck,
  Award,
  Stethoscope,
  Calculator,
  LayoutDashboard,
  FolderKanban,
  LineChart,
  FileBarChart,
  GitCompare,
  ArchiveRestore,
  Activity,
  ReceiptText,
  UsersRound,
  Users,
  UserPlus,
  FileUp,
  KanbanSquare,
  Handshake,
  ShieldCheck,
  Settings,
  Moon,
  LogOut,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()

  const userName = user?.name || user?.email || 'Usuário'
  const userInitials = userName.substring(0, 2).toUpperCase()
  const userRole = user?.role

  const isVisitor = !user
  const navGroups = []

  navGroups.push({
    label: 'CONSULT PLAN',
    items: [
      { title: 'Home', url: '/consult-plan/home', icon: Home },
      { title: 'Fontes de Funding', url: '/consult-plan/funding', icon: CircleDollarSign },
      { title: 'Entregáveis', url: '/consult-plan/entregaveis', icon: PackageCheck },
      { title: 'Benefícios na Prática', url: '/consult-plan/beneficios', icon: Award },
      {
        title: 'Solicitar Diagnóstico',
        url: '/consult-plan/solicitar-diagnostico',
        icon: Stethoscope,
      },
      { title: 'Simuladores Financeiros', url: '/consult-plan/simuladores', icon: Calculator },
    ],
  })

  if (
    isVisitor ||
    userRole === 'cliente' ||
    userRole === 'administrador' ||
    userRole === 'admin' ||
    !userRole
  ) {
    navGroups.push({
      label: 'ÁREA DO CLIENTE',
      items: [
        { title: 'Dashboard Cliente', url: '/portal-cliente/dashboard', icon: LayoutDashboard },
        { title: 'Meu Projeto', url: '/portal-cliente/meu-projeto', icon: FolderKanban },
        {
          title: 'Dashboard Executivo',
          url: '/portal-cliente/dashboard-executivo',
          icon: LineChart,
        },
        {
          title: 'Análise Financeira',
          url: '/portal-cliente/analise-financeira',
          icon: FileBarChart,
        },
        { title: 'Cenários', url: '/portal-cliente/cenarios', icon: GitCompare },
        { title: 'Análises Salvas', url: '/portal-cliente/analises-salvas', icon: ArchiveRestore },
        {
          title: 'Acompanhamento',
          url: '/portal-cliente/acompanhamento-desempenho',
          icon: Activity,
        },
        {
          title: 'Simulador Financeiro',
          url: '/portal-cliente/simulador-financeiro',
          icon: Calculator,
        },
        {
          title: 'Investimentos e Cenários',
          url: '/portal-cliente/investimentos-cenarios',
          icon: LineChart,
        },
        { title: 'Mapa de Dívidas', url: '/portal-cliente/mapa-dividas', icon: ReceiptText },
      ],
    })
  }

  if (
    isVisitor ||
    userRole === 'parceiro' ||
    userRole === 'administrador' ||
    userRole === 'admin'
  ) {
    navGroups.push({
      label: 'ÁREA DO PARCEIRO',
      items: [
        { title: 'Dashboard Parceiro', url: '/portal/parceiro', icon: LayoutDashboard },
        { title: 'Cadastrar Cliente', url: '/area-parceiro/cadastrar-cliente', icon: UserPlus },
        { title: 'Meus Clientes', url: '/area-parceiro/meus-clientes', icon: Users },
        { title: 'Gestão de Clientes', url: '/portal-parceiro/gestao-clientes', icon: UsersRound },
        {
          title: 'Minhas Comissões',
          url: '/area-parceiro/minhas-comissoes',
          icon: CircleDollarSign,
        },
        { title: 'Anexar Documentos', url: '/portal-parceiro/anexar-documentos', icon: FileUp },
        {
          title: 'Pipeline de Demandas',
          url: '/portal-parceiro/pipeline-demandas',
          icon: KanbanSquare,
        },
        { title: 'CRM Parceiros', url: '/portal-parceiro/crm-parceiros', icon: Handshake },
      ],
    })
  }

  if (isVisitor || userRole === 'administrador' || userRole === 'admin') {
    navGroups.push({
      label: 'ADMINISTRAÇÃO',
      items: [
        { title: 'Dashboard Admin', url: '/admin/dashboard', icon: ShieldCheck },
        { title: 'Aprovar Parceiros', url: '/admin/parceiros', icon: Handshake },
        { title: 'Base de Clientes', url: '/admin/clientes', icon: UsersRound },
        { title: 'Administradores', url: '/admin/administradores', icon: ShieldCheck },
      ],
    })
  }

  navGroups.push({
    label: 'SISTEMA',
    items: [{ title: 'Configurações', url: '#', icon: Settings }],
  })

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0"
      style={
        {
          '--sidebar-background': '#002147',
          '--sidebar-foreground': '#e2e8f0',
          '--sidebar-border': '#1A3A5F',
          '--sidebar-accent': '#1A3A5F',
          '--sidebar-accent-foreground': '#ffffff',
          '--sidebar-primary': '#C5A059',
          '--sidebar-primary-foreground': '#002147',
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="h-16 flex items-center px-4">
        <div className="flex items-center gap-2 font-bold text-lg text-white w-full overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-[#C5A059] flex items-center justify-center text-[#002147] shrink-0 font-extrabold text-xl">
            D
          </div>
          <span className="truncate group-data-[collapsible=icon]:hidden tracking-wide">
            Diamond Group
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="font-bold text-slate-300 tracking-wider mb-2 font-sans text-[0.75rem] uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    location.pathname === item.url ||
                    (item.url !== '#' && location.pathname.startsWith(item.url + '/'))
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className="text-slate-200 hover:bg-[#1A3A5F]/80 hover:text-white data-[active=true]:bg-[#C5A059] data-[active=true]:text-[#002147] data-[active=true]:font-semibold data-[active=true]:shadow-md data-[active=true]:hover:bg-[#C5A059]/90 data-[active=true]:hover:text-[#002147] transition-colors"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}

                {group.label === 'SISTEMA' && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="text-slate-200 hover:text-white hover:bg-[#1A3A5F]/80"
                    >
                      <div className="flex items-center justify-between w-full cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Moon className="w-4 h-4" />
                          <span>Dark mode</span>
                        </div>
                        <Switch className="group-data-[collapsible=icon]:hidden" />
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[#1A3A5F]">
        {user ? (
          <>
            <div className="flex items-center gap-3 w-full overflow-hidden">
              <Avatar className="h-9 w-9 shrink-0 border border-[#1A3A5F]">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?seed=${user.id || 1}`}
                />
                <AvatarFallback className="bg-[#1A3A5F] text-white">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold text-white truncate">{userName}</span>
                <span className="text-xs text-slate-400 truncate">{user.email}</span>
              </div>
            </div>
            <SidebarMenu className="mt-4 group-data-[collapsible=icon]:hidden">
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="hover:bg-[#1A3A5F]/50">
                  <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        ) : (
          <SidebarMenu className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="bg-[#C5A059] text-[#002147] hover:bg-[#C5A059]/90 font-bold transition-colors"
              >
                <Link to="/login" className="w-full flex items-center justify-center">
                  <span>Fazer Login</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
