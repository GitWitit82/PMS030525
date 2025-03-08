import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeftIcon, EditIcon } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const workflow = await db.workflow.findUnique({
    where: { id },
    select: { name: true }
  })

  return {
    title: workflow ? `${workflow.name} | Workflow PMS` : 'Workflow | Workflow PMS',
    description: 'View workflow template details',
  }
}

/**
 * Workflow detail page component
 */
export default async function WorkflowPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only ADMIN and MANAGER can access workflows
  if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  const workflow = await db.workflow.findUnique({
    where: { id },
    include: {
      phases: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { createdAt: 'asc' }
          }
        }
      },
      _count: {
        select: {
          projects: true
        }
      }
    }
  })

  if (!workflow) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <Link href="/workflows">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{workflow.name}</h1>
            <p className="text-muted-foreground">
              {workflow.description || 'No description provided'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {workflow._count.projects} project{workflow._count.projects === 1 ? '' : 's'}
          </Badge>
          <Button asChild>
            <Link href={`/workflows/${workflow.id}/edit`}>
              <EditIcon className="h-4 w-4 mr-2" />
              Edit Workflow
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {workflow.phases.map((phase, index) => (
          <div key={phase.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Phase {index + 1}: {phase.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {phase.tasks.length} task{phase.tasks.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {phase.tasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{task.name}</h3>
                    <Badge>{task.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.description || 'No description provided'}
                  </p>
                  {task.manHours && (
                    <p className="text-sm">
                      Estimated time: {task.manHours} hours
                    </p>
                  )}
                  {task.formTemplate && (
                    <Badge variant="outline">Has form template</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 