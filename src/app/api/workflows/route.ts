import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * Workflow creation schema validation
 */
const createWorkflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  phases: z.array(z.object({
    name: z.string().min(1, 'Phase name is required'),
    order: z.number().int().min(0),
    tasks: z.array(z.object({
      name: z.string().min(1, 'Task name is required'),
      description: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
      manHours: z.number().optional(),
      formTemplate: z.any().optional() // JSON schema for form template
    })).default([])
  })).default([])
})

/**
 * GET /api/workflows - List all workflows
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await db.workflow.count({
      where: {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      }
    })

    // Get workflows with phases count
    const workflows = await db.workflow.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      include: {
        _count: {
          select: {
            phases: true,
            projects: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      workflows,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error('Failed to fetch workflows:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * POST /api/workflows - Create a new workflow
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only ADMIN and MANAGER can create workflows
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const json = await request.json()
    const body = createWorkflowSchema.parse(json)

    const workflow = await db.workflow.create({
      data: {
        name: body.name,
        description: body.description,
        phases: {
          create: body.phases.map(phase => ({
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
          }))
        }
      },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    })

    return NextResponse.json(workflow)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    console.error('Failed to create workflow:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * DELETE /api/workflows - Delete multiple workflows
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only ADMIN can delete workflows
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const json = await request.json()
    const { ids } = z.object({ ids: z.array(z.string()) }).parse(json)

    await db.workflow.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
    console.error('Failed to delete workflows:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 