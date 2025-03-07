import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from './data-table'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface Workflow {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    phases: number
    projects: number
  }
}

interface WorkflowListProps {
  initialData: Workflow[]
}

/**
 * Column definitions for the workflow table
 */
const columns: ColumnDef<Workflow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: '_count.phases',
    header: 'Phases',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original._count.phases}
      </Badge>
    ),
  },
  {
    accessorKey: '_count.projects',
    header: 'Projects',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original._count.projects}
      </Badge>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.updatedAt), { addSuffix: true })}
      </span>
    ),
  },
]

/**
 * Workflow list component that displays workflows in a data table
 */
export function WorkflowList({ initialData }: WorkflowListProps) {
  const router = useRouter()

  const handleRowClick = (workflow: Workflow) => {
    router.push(`/workflows/${workflow.id}`)
  }

  return (
    <DataTable
      columns={columns}
      data={initialData}
      onRowClick={handleRowClick}
    />
  )
} 