import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { WorkflowForm } from '@/components/workflows/workflow-form'

export const metadata: Metadata = {
  title: 'Create Workflow | Workflow PMS',
  description: 'Create a new workflow template',
}

/**
 * Page component for creating new workflows
 */
export default async function NewWorkflowPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only ADMIN and MANAGER can create workflows
  if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Workflow</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="border rounded-lg p-6">
            <WorkflowForm />
          </div>
        </div>
        <div className="col-span-3">
          <div className="border rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Give your workflow a clear, descriptive name</li>
              <li>• Add phases in the order they should be completed</li>
              <li>• Break down phases into specific, manageable tasks</li>
              <li>• Specify task priorities and estimated hours</li>
              <li>• Add form templates for tasks that require data collection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 