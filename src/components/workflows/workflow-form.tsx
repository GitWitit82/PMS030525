'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Workflow, Priority } from '@prisma/client'

interface FormTemplate {
  fields: Array<{
    type: string
    label: string
    required?: boolean
    options?: string[]
  }>
}

interface Task {
  id: string
  name: string
  description: string | null
  priority: Priority
  manHours: number | null
  formTemplate: FormTemplate | null
}

interface Phase {
  id: string
  name: string
  order: number
  tasks: Task[]
}

interface WorkflowData extends Omit<Workflow, 'phases'> {
  phases: Phase[]
}

interface WorkflowFormProps {
  workflow?: WorkflowData
}

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
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
      manHours: z.number().optional(),
      formTemplate: z.object({
        fields: z.array(z.object({
          type: z.string(),
          label: z.string(),
          required: z.boolean().optional(),
          options: z.array(z.string()).optional()
        }))
      }).nullable().optional()
    })).default([])
  })).default([])
})

type FormData = z.infer<typeof formSchema>

/**
 * Form component for creating and editing workflows
 */
export function WorkflowForm({ workflow }: WorkflowFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

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
          formTemplate: task.formTemplate || undefined
        }))
      }))
    } : {
      name: '',
      description: '',
      phases: []
    }
  })

  const { fields: phaseFields, append: appendPhase, remove: removePhase } = useFieldArray({
    name: 'phases',
    control: form.control
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const response = await fetch(workflow ? `/api/workflows/${workflow.id}` : '/api/workflows', {
        method: workflow ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to save workflow')
      }

      toast.success(workflow ? 'Workflow updated' : 'Workflow created')
      router.push('/workflows')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
      console.error(error)
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          {phaseFields.map((phase, phaseIndex) => (
            <div key={phase.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center">
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
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => appendPhase({ name: '', order: phaseFields.length, tasks: [] })}
        >
          Add Phase
        </Button>

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