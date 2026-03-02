'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import TaskCard from '@/components/TaskCard';
import AddTaskModal from '@/components/AddTaskModal';
import { PlusIcon } from '@heroicons/react/24/outline';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  created_at: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [filter]);

  async function loadTasks() {
    setIsLoading(true);
    try {
      let sql = 'SELECT * FROM tasks';
      if (filter !== 'all') {
        sql += ` WHERE status = '${filter}'`;
      }
      sql += ' ORDER BY created_at DESC';
      
      const result = await db.execute(sql);
      setTasks(result.rows as Task[]);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
    setIsLoading(false);
  }

  async function addTask(taskData: any) {
    try {
      await db.execute({
        sql: 'INSERT INTO tasks (title, description, priority, due_date, status) VALUES (?, ?, ?, ?, ?)',
        args: [
          taskData.title,
          taskData.description || null,
          taskData.priority,
          taskData.due_date || null,
          'todo'
        ]
      });
      loadTasks();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  }

  async function updateTaskStatus(id: string, status: Task['status']) {
    try {
      await db.execute({
        sql: 'UPDATE tasks SET status = ? WHERE id = ?',
        args: [status, id]
      });
      loadTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  async function deleteTask(id: string) {
    try {
      await db.execute({
        sql: 'DELETE FROM tasks WHERE id = ?',
        args: [id]
      });
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const filterButtons = [
    { key: 'all' as const, label: 'All Tasks', count: stats.total },
    { key: 'todo' as const, label: 'To Do', count: stats.todo },
    { key: 'in_progress' as const, label: 'In Progress', count: stats.in_progress },
    { key: 'done' as const, label: 'Completed', count: stats.done },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                TaskFlow Pro
              </h1>
              <p className="text-slate-600 mt-1">A modern task management system with priorities and deadlines</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" />
              New Task
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {filterButtons.map((btn) => (
              <motion.button
                key={btn.key}
                onClick={() => setFilter(btn.key)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  filter === btn.key
                    ? 'bg-blue-50 border-blue-500 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-2xl font-bold text-slate-900">{btn.count}</div>
                <div className="text-sm text-slate-600 mt-1">{btn.label}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No tasks yet</h3>
            <p className="text-slate-600 mb-6">Create your first task to get started!</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30"
            >
              <PlusIcon className="w-5 h-5" />
              Create First Task
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={updateTaskStatus}
                  onDelete={deleteTask}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTask}
      />
    </div>
  );
}
