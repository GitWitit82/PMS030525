import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { WorkflowList } from '@/components/workflows/workflow-list'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Workflows | Workflow PMS',
  description: 'Manage workflow templates for your projects',
}

/**
 * Workflow list page component
 */
export default async function WorkflowsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only ADMIN and MANAGER can access workflows
  if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  // Get initial workflows data
  const workflows = await db.workflow.findMany({
    take: 10,
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      _count: {
        select: {
          phases: true,
          projects: true,
        },
      },
    },
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Workflows</h2>
        <Link href="/workflows/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        </Link>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <WorkflowList initialData={workflows} />
      </div>
    </div>
  )
} 