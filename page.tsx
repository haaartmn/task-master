'use client'

import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { Task } from '@/types/task'
import { TaskItem } from '@/components/task-item'
import { TaskForm } from '@/components/task-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [parentId, setParentId] = useState<string | undefined>()
  const [filters, setFilters] = useState({
    showCompleted: true,
    priority: {
      low: true,
      medium: true,
      high: true,
    },
  })

  const handleAddTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: taskData.title!,
      description: taskData.description,
      dueDate: taskData.dueDate,
      priority: taskData.priority!,
      status: 'todo',
      tags: taskData.tags!,
      parentId: taskData.parentId,
      children: [],
      level: taskData.parentId ? 1 : 0,
      order: tasks.length,
    }

    if (taskData.parentId) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === taskData.parentId) {
            return {
              ...task,
              children: [...task.children, newTask],
            }
          }
          return task
        })
      )
    } else {
      setTasks((prevTasks) => [...prevTasks, newTask])
    }

    setIsFormOpen(false)
    setParentId(undefined)
  }

  const handleEditTask = (taskData: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === editingTask?.id) {
          return {
            ...task,
            ...taskData,
          }
        }
        return task
      })
    )
    setEditingTask(null)
    setIsFormOpen(false)
  }

  const handleToggleTask = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: task.status === 'completed' ? 'todo' : 'completed',
          }
        }
        return task
      })
    )
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
  }

  const filteredTasks = tasks.filter((task) => {
    if (!filters.showCompleted && task.status === 'completed') return false
    if (!filters.priority[task.priority]) return false
    return true
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={filters.showCompleted}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({ ...prev, showCompleted: checked }))
                }
              >
                Show Completed
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.priority.low}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: { ...prev.priority, low: checked },
                  }))
                }
              >
                Low Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.priority.medium}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: { ...prev.priority, medium: checked },
                  }))
                }
              >
                Medium Priority
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.priority.high}
                onCheckedChange={(checked) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: { ...prev.priority, high: checked },
                  }))
                }
              >
                High Priority
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggleTask}
            onAddSubtask={(parentId) => {
              setParentId(parentId)
              setIsFormOpen(true)
            }}
            onEdit={(task) => {
              setEditingTask(task)
              setIsFormOpen(true)
            }}
            onDelete={handleDeleteTask}
          />
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : parentId ? 'Add Subtask' : 'Add Task'}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask ?? undefined}
            parentId={parentId}
            onSubmit={editingTask ? handleEditTask : handleAddTask}
            onCancel={() => {
              setIsFormOpen(false)
              setEditingTask(null)
              setParentId(undefined)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

