import { cn } from "@/lib/utils"
import { PropsWithChildren } from "react"

interface MainLayoutProps extends PropsWithChildren {
  className?: string
}

export const MainLayout = ({ children, className }: MainLayoutProps) => {
  return (
    <div className={cn(
      "min-h-screen bg-background font-sans antialiased",
      className
    )}>
      <div className="relative flex min-h-screen flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout 