"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import {
  ChevronRight,
  Menu,
  LayoutDashboard,
  Users,
  FolderKanban,
  Settings,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean
  isCollapsible?: boolean
  onToggleCollapse?: () => void
}

const sidebarLinks = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/users",
  },
  {
    title: "Projects",
    icon: FolderKanban,
    href: "/dashboard/projects",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
]

export function Sidebar({
  className,
  isCollapsed = false,
  isCollapsible = true,
  onToggleCollapse,
  ...props
}: SidebarProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "relative hidden h-screen border-r bg-background lg:flex",
          isCollapsed ? "w-[80px]" : "w-[240px]",
          className
        )}
        {...props}
      >
        <div className="flex h-full w-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b px-4">
            <span className={cn("font-bold", isCollapsed ? "hidden" : "block")}>
              PMS
            </span>
            {isCollapsible && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="h-6 w-6"
              >
                <ChevronRight
                  className={cn("h-4 w-4 transition-transform", {
                    "rotate-180": isCollapsed,
                  })}
                />
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <ScrollArea className="flex-1 py-2">
            <nav className="grid gap-1 px-2">
              {sidebarLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isCollapsed ? "px-2" : "px-4"
                  )}
                  onClick={() => router.push(link.href)}
                >
                  <link.icon className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
                  {!isCollapsed && <span>{link.title}</span>}
                </Button>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer with Theme Toggle */}
          <div className="border-t p-4">
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
              {!isCollapsed && <span className="text-sm">Theme</span>}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function MobileSidebar() {
  const router = useRouter()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-bold">PMS</span>
      </div>

      {/* Navigation Links */}
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 p-2">
          {sidebarLinks.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start px-4"
              onClick={() => router.push(link.href)}
            >
              <link.icon className="mr-2 h-5 w-5" />
              <span>{link.title}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer with Theme Toggle */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
} 