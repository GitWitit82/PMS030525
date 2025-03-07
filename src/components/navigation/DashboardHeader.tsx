import Link from "next/link"
import { UserNav } from "./UserNav"
import { ThemeToggle } from "../ui/ThemeToggle"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  className?: string
}

export const DashboardHeader = ({ className }: DashboardHeaderProps) => {
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background", className)}>
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold">Workflow PMS</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader 