import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { WorkflowForm } from '@/components/workflows/workflow-form'

interface PageProps {
  params: Promise<{ id: string }>
}

interface FormTemplate {
  fields: Array<{
    type: string
    label: string
    required?: boolean
    options?: string[]
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const workflow = await db.workflow.findUnique({
    where: { id },
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
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only ADMIN and MANAGER can edit workflows
  if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const workflow = await db.workflow.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      version: true,
      isActive: true,
      createdById: true,
      metadata: true,
      phases: {
        select: {
          id: true,
          name: true,
          order: true,
          tasks: {
            select: {
              id: true,
              name: true,
              description: true,
              priority: true,
              manHours: true,
              formTemplate: true
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!workflow) {
    notFound()
  }

  // Transform the workflow data to match the expected types
  const transformedWorkflow = {
    ...workflow,
    phases: workflow.phases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(task => ({
        ...task,
        formTemplate: task.formTemplate ? {
          fields: (task.formTemplate as unknown as FormTemplate)?.fields || []
        } : null
      }))
    }))
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Workflow</h1>
        <p className="text-muted-foreground">
          Update workflow template details and structure
        </p>
      </div>
      <WorkflowForm workflow={transformedWorkflow} />
    </div>
  )
} 