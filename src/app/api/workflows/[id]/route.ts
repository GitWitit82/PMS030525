import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * Workflow update schema validation
 */
const updateWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  phases: z.array(z.object({
    id: z.string().optional(), // Existing phase ID
    name: z.string().min(1, 'Phase name is required'),
    order: z.number().int().min(0),
    tasks: z.array(z.object({
      id: z.string().optional(), // Existing task ID
      name: z.string().min(1, 'Task name is required'),
      description: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
      manHours: z.number().optional(),
      formTemplate: z.any().optional()
    })).default([])
  })).optional()
})

/**
 * GET /api/workflows/[id] - Get a specific workflow
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
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
      return new NextResponse('Workflow not found', { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Failed to fetch workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * PATCH /api/workflows/[id] - Update a workflow
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only ADMIN and MANAGER can update workflows
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const json = await request.json()
    const body = updateWorkflowSchema.parse(json)

    // Start a transaction to handle complex updates
    const workflow = await db.$transaction(async (tx) => {
      // Update workflow basic info
      const workflow = await tx.workflow.update({
        where: { id: params.id },
        data: {
          name: body.name,
          description: body.description,
        },
        include: {
          phases: {
            include: {
              tasks: true
            }
          }
        }
      })

      // If phases are provided, update them
      if (body.phases) {
        // Delete phases that are not in the update
        const phaseIds = body.phases
          .filter(phase => phase.id)
          .map(phase => phase.id as string)
        
        await tx.phase.deleteMany({
          where: {
            workflowId: params.id,
            id: {
              notIn: phaseIds
            }
          }
        })

        // Update or create phases
        for (const phase of body.phases) {
          if (phase.id) {
            // Update existing phase
            await tx.phase.update({
              where: { id: phase.id },
              data: {
                name: phase.name,
                order: phase.order,
                tasks: {
                  deleteMany: {}, // Remove all existing tasks
                  create: phase.tasks.map(task => ({
                    name: task.name,
                    description: task.description,
                    priority: task.priority,
                    manHours: task.manHours,
                    formTemplate: task.formTemplate
                  }))
                }
              }
            })
          } else {
            // Create new phase
            await tx.phase.create({
              data: {
                workflowId: params.id,
                name: phase.name,
                order: phase.order,
                tasks: {
                  create: phase.tasks.map(task => ({
                    name: task.name,
                    description: task.description,
                    priority: task.priority,
                    manHours: task.manHours,
                    formTemplate: task.formTemplate
                  }))
                }
              }
            })
          }
        }
      }

      // Return updated workflow
      return tx.workflow.findUnique({
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
    })

    if (!workflow) {
      return new NextResponse('Workflow not found', { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    console.error('Failed to update workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * DELETE /api/workflows/[id] - Delete a workflow
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only ADMIN can delete workflows
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Check if workflow exists
    const workflow = await db.workflow.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            projects: true
          }
        }
      }
    })

    if (!workflow) {
      return new NextResponse('Workflow not found', { status: 404 })
    }

    // Don't allow deletion if workflow has active projects
    if (workflow._count.projects > 0) {
      return new NextResponse(
        'Cannot delete workflow with associated projects',
        { status: 400 }
      )
    }

    await db.workflow.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 