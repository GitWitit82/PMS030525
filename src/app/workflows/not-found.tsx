import Link from 'next/link'
import { Button } from '@/components/ui/button'

/**
 * Not found page for workflows
 */
export default function NotFound() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold">Workflow Not Found</h2>
        <p className="text-muted-foreground">
          The workflow you're looking for doesn't exist or has been deleted.
        </p>
      </div>
      <Link href="/workflows">
        <Button>Return to Workflows</Button>
      </Link>
    </div>
  )
} 