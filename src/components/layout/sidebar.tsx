'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Settings,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/dashboard/users",
    color: "text-violet-500",
  },
  {
    label: "Projects",
    icon: FolderKanban,
    href: "/dashboard/projects",
    color: "text-pink-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-gray-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">PMS</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Button
          onClick={() => signOut()}
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
          variant="ghost"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  )
} 