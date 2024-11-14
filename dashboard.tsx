'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Calendar as CalendarIcon, CheckCircle2, List, PieChart, Plus, Settings, Tag, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Task = {
  id: number
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  category: string
  subtasks: { id: number; title: string; completed: boolean }[]
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'デザインミーティング', description: 'チームとのデザインレビュー', dueDate: '2023-06-15', priority: 'high', completed: false, category: 'ワーク', subtasks: [
      { id: 1, title: 'アジェンダ作成', completed: false },
      { id: 2, title: 'プレゼン資料準備', completed: true },
    ] },
    { id: 2, title: 'プロジェクト提案書作成', description: '新規プロジェクトの提案書を作成', dueDate: '2023-06-20', priority: 'medium', completed: false, category: 'ワーク', subtasks: [] },
    { id: 3, title: '週次レポート提出', description: '先週の進捗レポートを作成し提出', dueDate: '2023-06-18', priority: 'low', completed: true, category: 'ワーク', subtasks: [] },
  ])

  const [newTask, setNewTask] = useState('')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState({ priority: 'all', category: 'all' })
  const [notifications, setNotifications] = useState<string[]>([])

  useEffect(() => {
    const checkDeadlines = () => {
      const today = new Date()
      const newNotifications = tasks
        .filter(task => !task.completed && new Date(task.dueDate) <= today)
        .map(task => `タスク "${task.title}" の期限が過ぎています！`)
      setNotifications(newNotifications)
    }

    checkDeadlines()
    const interval = setInterval(checkDeadlines, 60000) // 1分ごとにチェック
    return () => clearInterval(interval)
  }, [tasks])

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, { 
        id: tasks.length + 1, 
        title: newTask, 
        description: '',
        dueDate: new Date().toISOString().split('T')[0], 
        priority: 'medium', 
        completed: false,
        category: 'その他',
        subtasks: []
      }])
      setNewTask('')
    }
  }

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task))
    setEditingTask(null)
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const newTasks = Array.from(tasks)
    const [reorderedItem] = newTasks.splice(result.source.index, 1)
    newTasks.splice(result.destination.index, 0, reorderedItem)

    setTasks(newTasks)
  }

  const filteredTasks = tasks.filter(task => 
    (filter.priority === 'all' || task.priority === filter.priority) &&
    (filter.category === 'all' || task.category === filter.category)
  )

  const completionRate = tasks.length > 0 ? (tasks.filter(task => task.completed).length / tasks.length) * 100 : 0

  const chartData = [
    { name: '完了', value: tasks.filter(task => task.completed).length },
    { name: '未完了', value: tasks.filter(task => !task.completed).length },
  ]

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* サイドバー */}
      <aside className="w-64 bg-white dark:bg-gray-800 p-4 hidden md:block">
        <div className="flex items-center mb-6">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">TaskMaster</span>
        </div>
        <nav>
          <Button variant="ghost" className="w-full justify-start mb-2">
            <List className="mr-2 h-4 w-4" />
            タスク一覧
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-2">
            <CalendarIcon className="mr-2 h-4 w-4" />
            カレンダー
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-2">
            <Tag className="mr-2 h-4 w-4" />
            カテゴリー
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-2">
            <PieChart className="mr-2 h-4 w-4" />
            レポート
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            設定
          </Button>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-4 overflow-auto">
        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <div className="flex items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>通知</DialogTitle>
                  <DialogDescription>
                    {notifications.length > 0 ? (
                      <ul>
                        {notifications.map((notification, index) => (
                          <li key={index} className="flex items-center mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                            {notification}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>新しい通知はありません。</p>
                    )}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* タスク追加フォーム */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={(e) => { e.preventDefault(); addTask(); }} className="flex space-x-2">
              <Input
                type="text"
                placeholder="新しいタスクを追加"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" /> 追加
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* フィルター */}
        <div className="flex space-x-4 mb-6">
          <Select value={filter.priority} onValueChange={(value) => setFilter({ ...filter, priority: value })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="優先度でフィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="low">低</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="high">高</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter.category} onValueChange={(value) => setFilter({ ...filter, category: value })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="カテゴリーでフィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="ワーク">ワーク</SelectItem>
              <SelectItem value="個人">個人</SelectItem>
              <SelectItem value="その他">その他</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* タブ（リスト/カレンダー） */}
        <Tabs defaultValue="list" className="mb-6">
          <TabsList>
            <TabsTrigger value="list">リスト</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            {/* タスクリスト */}
            <Card>
              <CardHeader>
                <CardTitle>タスク一覧</CardTitle>
                <CardDescription>あなたのタスクとその状態</CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="tasks">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {filteredTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                              >
                                <Checkbox
                                  checked={task.completed}
                                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                                />
                                <div className="flex-1">
                                  <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                    {task.title}
                                  </h3>
                                  <p className="text-sm text-gray-500">{task.description}</p>
                                  <div className="flex items-center mt-2 space-x-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{task.category}</span>
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{task.priority}</span>
                                    <span className="text-xs text-gray-500">{task.dueDate}</span>
                                  </div>
                                  {task.subtasks.length > 0 && (
                                    <div className="mt-2">
                                      <h4 className="text-sm font-medium">サブタスク:</h4>
                                      <ul className="ml-4 list-disc">
                                        {task.subtasks.map(subtask => (
                                          <li key={subtask.id} className={subtask.completed ? 'line-through text-gray-500' : ''}>
                                            {subtask.title}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setEditingTask(task)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>タスクを編集</DialogTitle>
                                    </DialogHeader>
                                    {editingTask && (
                                      <form onSubmit={(e) => { e.preventDefault(); updateTask(editingTask); }}>
                                        <div className="space-y-4">
                                          <div>
                                            <Label htmlFor="title">タイトル</Label>
                                            <Input
                                              id="title"
                                              value={editingTask.title}
                                              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value})}
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="description">説明</Label>
                                            <Textarea
                                              id="description"
                                              value={editingTask.description}
                                              onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="dueDate">期限</Label>
                                            <Input
                                              id="dueDate"
                                              type="date"
                                              value={editingTask.dueDate}
                                              onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor="priority">優先度</Label>
                                            <Select
                                              value={editingTask.priority}
                                              onValueChange={(value) => setEditingTask({...editingTask, priority: value as 'low' | 'medium' | 'high'})}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="優先度を選択" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="low">低</SelectItem>
                                                <SelectItem value="medium">中</SelectItem>
                                                <SelectItem value="high">高</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <Label htmlFor="category">カテゴリー</Label>
                                            <Select
                                              value={editingTask.category}
                                              onValueChange={(value) => setEditingTask({...editingTask, category: value})}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="カテゴリーを選択" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="ワーク">ワーク</SelectItem>
                                                <SelectItem value="個人">個人</SelectItem>
                                                <SelectItem value="その他">その他</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                        <div className="flex justify-end mt-4">
                                          <Button type="submit">更新</Button>
                                        </div>
                                      </form>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendar">
            {/* カレンダービュー */}
            <Card>
              <CardHeader>
                <CardTitle>カレンダー</CardTitle>
                <CardDescription>タスクのスケジュール</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>タスク完了率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>進捗状況</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px]">
                <div className="relative h-40 w-40">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-300"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-blue-600"
                      strokeWidth="10"
                      strokeDasharray={`${completionRate * 2.83} 283`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{Math.round(completionRate)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
