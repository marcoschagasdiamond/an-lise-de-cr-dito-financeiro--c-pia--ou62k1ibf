import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { LayoutDashboard, UsersRound, Handshake, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const adminNavItems = [
  { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Parceiros', url: '/admin/parceiros', icon: Handshake },
  { title: 'Clientes', url: '/admin/clientes', icon: UsersRound },
  { title: 'Administradores', url: '/admin/administradores', icon: ShieldCheck },
]

export function AdminSidebar() {
  const location = useLocation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/admin/login')
  }

  return (
    <Sidebar
      className="border-r-0"
      style={
        {
          '--sidebar-background': '#002147',
          '--sidebar-foreground': '#ffffff',
          '--sidebar-primary': '#C5A059',
          '--sidebar-primary-foreground': '#ffffff',
          '--sidebar-accent': 'rgba(255,255,255,0.1)',
          '--sidebar-accent-foreground': '#ffffff',
          '--sidebar-border': 'rgba(255,255,255,0.1)',
          '--sidebar-ring': '#C5A059',
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 font-bold text-xl text-[#C5A059]">
          <ShieldCheck className="w-8 h-8" />
          Diamond Admin
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-slate-200 hover:bg-sidebar-accent hover:text-white data-[active=true]:bg-[#C5A059] data-[active=true]:text-[#002147] data-[active=true]:font-semibold data-[active=true]:hover:bg-[#C5A059]/90 data-[active=true]:hover:text-[#002147] transition-colors"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem className="mt-8">
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
