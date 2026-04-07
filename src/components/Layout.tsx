import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopProgressBar } from './TopProgressBar'

export default function Layout() {
  return (
    <SidebarProvider>
      <TopProgressBar />
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 bg-[#F8FAFC] dark:bg-background">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
