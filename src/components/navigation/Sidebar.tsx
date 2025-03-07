import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Sidebar() {
  const router = useRouter()

  return (
    <div className="h-full border-r flex flex-col overflow-hidden">
      <div className="p-6">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => router.push("/dashboard")}
        >
          <span className="font-bold">PMS</span>
        </Button>
      </div>
    </div>
  )
} 