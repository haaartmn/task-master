export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in-progress' | 'completed'
  category?: string
  tags: string[]
  parentId?: string
  children: Task[]
  level: number
  order: number
}

export interface Category {
  id: string
  name: string
  color: string
}

