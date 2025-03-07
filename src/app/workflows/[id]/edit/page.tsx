import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { WorkflowForm } from '@/components/workflows/workflow-form'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const workflow = await db.workflow.findUnique({
    where: { id: params.id },
    select: { name: true }
  })

  return {
    title: workflow ? `Edit ${workflow.name} | Workflow PMS` : 'Edit Workflow | Workflow PMS',
    description: 'Edit workflow template',
  }
}

/**
 * Workflow edit page component
 */
export default async function EditWorkflowPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only ADMIN and MANAGER can edit workflows
  if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const workflow = await db.workflow.findUnique({
    where: { id: params.id },
    include: {
      phases: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { createdAt: 'asc' }
          }
        }
      }
    }
  })

  if (!workflow) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Workflow</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="border rounded-lg p-6">
            <WorkflowForm workflow={workflow} />
          </div>
        </div>
        <div className="col-span-3">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Review and update phase order if needed</li>
              <li>• Check task dependencies and timelines</li>
              <li>• Update task priorities based on current needs</li>
              <li>• Verify form templates are up to date</li>
              <li>• Consider impact on existing projects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 