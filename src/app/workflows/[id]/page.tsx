import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ArrowLeftIcon, EditIcon } from 'lucide-react'

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
    title: workflow ? `${workflow.name} | Workflow PMS` : 'Workflow | Workflow PMS',
    description: 'View workflow template details',
  }
}

/**
 * Workflow detail page component
 */
export default async function WorkflowPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Only ADMIN and MANAGER can access workflows
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workflows">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{workflow.name}</h2>
            <p className="text-sm text-muted-foreground">
              Last updated {formatDistanceToNow(workflow.updatedAt, { addSuffix: true })}
            </p>
          </div>
        </div>
        <Link href={`/workflows/${workflow.id}/edit`}>
          <Button>
            <EditIcon className="mr-2 h-4 w-4" />
            Edit Workflow
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">
                {workflow.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Phases</h3>
              <div className="space-y-4">
                {workflow.phases.map((phase) => (
                  <div key={phase.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{phase.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {phase.tasks.length} tasks
                        </p>
                      </div>
                      <Badge variant="secondary">Phase {phase.order + 1}</Badge>
                    </div>

                    <div className="space-y-3">
                      {phase.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="border rounded p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{task.name}</p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {task.manHours && (
                              <Badge variant="outline">
                                {task.manHours}h
                              </Badge>
                            )}
                            <Badge>{task.priority}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="border rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Statistics</h3>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Phases</dt>
                  <dd className="text-2xl font-bold">
                    {workflow.phases.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Tasks</dt>
                  <dd className="text-2xl font-bold">
                    {workflow.phases.reduce((acc, phase) => acc + phase.tasks.length, 0)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Projects</dt>
                  <dd className="text-2xl font-bold">
                    {workflow._count.projects}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Total Hours</dt>
                  <dd className="text-2xl font-bold">
                    {workflow.phases.reduce(
                      (acc, phase) =>
                        acc +
                        phase.tasks.reduce(
                          (taskAcc, task) => taskAcc + (task.manHours || 0),
                          0
                        ),
                      0
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Actions</h3>
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  Create Project from Template
                </Button>
                <Button className="w-full" variant="outline">
                  Duplicate Workflow
                </Button>
                {session.user.role === 'ADMIN' && workflow._count.projects === 0 && (
                  <Button className="w-full" variant="destructive">
                    Delete Workflow
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 