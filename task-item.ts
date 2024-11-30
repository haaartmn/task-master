'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronRight, ChevronDown, Plus, Edit, Trash, Tag } from 'lucide-react'
import { Task } from '@/types/task'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

interface TaskItemProps {
  task: Task
  onToggle: (taskId: string) => void
  onAddSubtask: (parentId: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  depth?: number
}

export function TaskItem({
  task,
  onToggle,
  onAddSubtask,
  onEdit,
  onDelete,
  depth = 0,
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 group">
        {task.children.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        <div style={{ marginLeft: `${depth * 24}px` }} className="flex-1 flex items-center gap-2">
          <Checkbox
            checked={task.status === 'completed'}
            onCheckedChange={() => onToggle(task.id)}
          />
          <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
            {task.title}
          </span>
          {task.dueDate && (
            <Badge variant="outline" className="ml-2">
              {format(new Date(task.dueDate), 'MMM d')}
            </Badge>
          )}
          {task.priority && (
            <Badge
              variant={
                task.priority === 'high'
                  ? 'destructive'
                  : task.priority === 'medium'
                  ? 'default'
                  : 'secondary'
              }
            >
              {task.priority}
            </Badge>
          )}
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
            </Badge>
          ))}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onAddSubtask(task.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(task.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {isExpanded && task.children.length > 0 && (
        <div className="pl-4">
          {task.children.map((childTask) => (
            <TaskItem
              key={childTask.id}
              task={childTask}
              onToggle={onToggle}
              onAddSubtask={onAddSubtask}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

