import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTaskStatus, deleteTask } from './api';
import type { Task, TaskInput } from './types';
import { Trash2, Loader2, AlertCircle, PlusCircle, CheckCircle, Clock, Circle } from 'lucide-react';
import { format } from 'date-fns';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks(filter);
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (title.length > 100) {
      setFormError('Title must be less than 100 characters');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createTask({ title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('Medium');
      fetchTasks();
    } catch (err: any) {
      setFormError(err.response?.data?.errors?.[0] || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const statusOrder = ['To Do', 'In Progress', 'Done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    try {
      await updateTaskStatus(id, nextStatus);
      setTasks(tasks.map(t => t._id === id ? { ...t, status: nextStatus as any } : t));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'Done': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: Record<string, string> = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Task Tracker</h1>
          <p className="mt-2 text-gray-600">Manage your tasks effectively.</p>
        </div>

        {/* Create Task Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" /> {formError}
              </div>
            )}
            <div>
              <input
                type="text"
                placeholder="Task Title (required, max 100 chars)"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <textarea
                placeholder="Description (optional)"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <select
                className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-70 font-medium"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                Create Task
              </button>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100 w-fit">
          {['All', 'To Do', 'In Progress', 'Done'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === f ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
              <p className="text-gray-500">No tasks found. Try creating one!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <button 
                      onClick={() => handleUpdateStatus(task._id, task.status)}
                      className="mt-1 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                      title="Click to advance status"
                    >
                      <StatusIcon status={task.status} />
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${task.status === 'Done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`mt-1 text-gray-600 text-sm ${task.status === 'Done' ? 'opacity-50' : ''}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <PriorityBadge priority={task.priority} />
                        <span className="text-xs text-gray-400">
                          {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
