'use client';

import { motion } from 'framer-motion';
import { CheckCircleIcon, ClockIcon, FlagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  created_at: string;
}

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: Task['status']) => void;
  onDelete: (id: string) => void;
}

const priorityConfig = {
  low: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '🟢' },
  medium: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🟡' },
  high: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: '🔴' },
};

const statusConfig = {
  todo: { color: 'bg-slate-100', button: 'Start', nextStatus: 'in_progress' as const },
  in_progress: { color: 'bg-blue-50', button: 'Complete', nextStatus: 'done' as const },
  done: { color: 'bg-green-50', button: 'Reopen', nextStatus: 'todo' as const },
};

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`relative overflow-hidden rounded-xl border border-slate-200 ${status.color} p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-50" 
        style={{ color: priority.color.includes('emerald') ? '#10b981' : priority.color.includes('amber') ? '#f59e0b' : '#ef4444' }} />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${priority.color}`}>
              <span>{priority.icon}</span>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-slate-600 mb-4 leading-relaxed">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500">
            {task.due_date && (
              <div className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                <span>Due {format(new Date(task.due_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FlagIcon className="w-4 h-4" />
              <span className="capitalize">{task.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={() => onStatusChange(task.id, status.nextStatus)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            {task.status === 'done' ? (
              <>↩️ {status.button}</>
            ) : task.status === 'in_progress' ? (
              <><CheckCircleIcon className="w-4 h-4" /> {status.button}</>
            ) : (
              <>▶️ {status.button}</>
            )}
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete task"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
