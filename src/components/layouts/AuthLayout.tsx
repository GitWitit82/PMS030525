import { PropsWithChildren } from "react"
import { MainLayout } from "./MainLayout"
import { cn } from "@/lib/utils"

interface AuthLayoutProps extends PropsWithChildren {
  className?: string
  showLogo?: boolean
}

export const AuthLayout = ({ children, className, showLogo = true }: AuthLayoutProps) => {
  return (
    <MainLayout className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className={cn("w-full max-w-md space-y-8", className)}>
        {showLogo && (
          <div className="flex justify-center">
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold tracking-tight">
                Workflow PMS
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Project Management System
              </p>
            </div>
          </div>
        )}
        {children}
      </div>
    </MainLayout>
  )
}

export default AuthLayout 