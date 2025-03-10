import { PropsWithChildren } from "react"
import { MainLayout } from "./MainLayout"
import { DashboardNav } from "../navigation/DashboardNav"
import { DashboardHeader } from "../navigation/DashboardHeader"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps extends PropsWithChildren {
  className?: string
}

export const DashboardLayout = ({ children, className }: DashboardLayoutProps) => {
  return (
    <MainLayout>
      <div className="relative flex min-h-screen flex-col">
        <DashboardHeader />
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <DashboardNav />
          </aside>
          <main className={cn("flex w-full flex-col overflow-hidden", className)}>
            {children}
          </main>
        </div>
      </div>
    </MainLayout>
  )
}

export default DashboardLayout 