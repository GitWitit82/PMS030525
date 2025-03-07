import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Workflow } from '@prisma/client'

/**
 * Form schema for workflow creation/editing
 */
const formSchema = z.object({
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
      formTemplate: z.any().optional()
    })).default([])
  })).default([])
})

type FormData = z.infer<typeof formSchema>

interface WorkflowFormProps {
  workflow?: Workflow & {
    phases: Array<{
      id: string
      name: string
      order: number
      tasks: Array<{
        id: string
        name: string
        description: string | null
        priority: 'LOW' | 'MEDIUM' | 'HIGH'
        manHours: number | null
        formTemplate: any | null
      }>
    }>
  }
}

/**
 * Form component for creating and editing workflows
 */
export function WorkflowForm({ workflow }: WorkflowFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  // Initialize form with existing workflow data or defaults
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: workflow ? {
      name: workflow.name,
      description: workflow.description || '',
      phases: workflow.phases.map(phase => ({
        name: phase.name,
        order: phase.order,
        tasks: phase.tasks.map(task => ({
          name: task.name,
          description: task.description || '',
          priority: task.priority,
          manHours: task.manHours || undefined,
          formTemplate: task.formTemplate
        }))
      }))
    } : {
      name: '',
      description: '',
      phases: []
    }
  })

  // Field array for managing phases
  const { fields: phaseFields, append: appendPhase, remove: removePhase } = 
    useFieldArray({
      name: 'phases',
      control: form.control
    })

  async function onSubmit(data: FormData) {
    try {
      setIsLoading(true)
      const url = workflow 
        ? `/api/workflows/${workflow.id}`
        : '/api/workflows'
      
      const response = await fetch(url, {
        method: workflow ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save workflow')
      }

      const savedWorkflow = await response.json()
      
      toast.success(
        workflow 
          ? 'Workflow updated successfully'
          : 'Workflow created successfully'
      )
      
      router.push(`/workflows/${savedWorkflow.id}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to save workflow:', error)
      toast.error('Failed to save workflow')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter workflow name" {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name for the workflow template.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter workflow description"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A detailed description of the workflow's purpose and process.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Phases</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => appendPhase({
                name: '',
                order: phaseFields.length,
                tasks: []
              })}
            >
              Add Phase
            </Button>
          </div>

          {phaseFields.map((phaseField, phaseIndex) => (
            <div key={phaseField.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name={`phases.${phaseIndex}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1 mr-4">
                      <FormLabel>Phase Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phase name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removePhase(phaseIndex)}
                >
                  Remove Phase
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`phases.${phaseIndex}.order`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tasks section would go here - similar pattern to phases */}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : workflow ? 'Update Workflow' : 'Create Workflow'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 