import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { careerApi } from '../api/careerApi.js';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  Code,
  Users,
  Compass,
  MessageSquare
} from 'lucide-react';

export function PlacementPrepPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionPercentage: 0
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Add Task Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    category: 'DSA',
    title: '',
    description: '',
    priority: 'medium',
    deadline: ''
  });

  const categories = [
    'All',
    'DSA',
    'Technical',
    'Aptitude',
    'HR',
    'Communication',
    'Projects',
    'Weekly Goals'
  ];

  const loadTasks = async (cat = selectedCategory) => {
    try {
      const res = await careerApi.getPlacementTasks(cat);
      if (res.success) {
        setTasks(res.tasks || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load placement tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(selectedCategory);
  }, [selectedCategory]);

  const handleToggle = async (taskId) => {
    try {
      const res = await careerApi.togglePlacementTask(taskId);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? res.task : t));
        loadTasks(selectedCategory);
      }
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const res = await careerApi.deletePlacementTask(taskId);
      if (res.success) {
        toast.success('Task removed.');
        setTasks(prev => prev.filter(t => t.id !== taskId));
        loadTasks(selectedCategory);
      }
    } catch (err) {
      toast.error('Failed to delete task.');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const res = await careerApi.createPlacementTask(newTask);
      if (res.success) {
        toast.success('Preparation goal added!');
        setModalOpen(false);
        setNewTask({
          category: 'DSA',
          title: '',
          description: '',
          priority: 'medium',
          deadline: ''
        });
        loadTasks(selectedCategory);
      }
    } catch (err) {
      toast.error('Failed to create task.');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>Campus Placement Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Placement Preparation Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Systematic preparation for campus drives: track your DSA problem solving, DBMS/OS fundamentals, aptitude drills, and HR interview responses.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary bg-indigo-500 hover:bg-indigo-600 text-xs py-2.5 px-4 shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Goal</span>
        </button>
      </div>

      {/* Progress & Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-base p-4 border border-slate-200 shadow-soft">
          <span className="text-xs text-slate-500 block">Overall Progress</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {summary.completionPercentage}%
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${summary.completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="card-base p-4 border border-slate-200 shadow-soft">
          <span className="text-xs text-slate-500 block">Completed Tasks</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {summary.completed}
          </div>
          <span className="text-[11px] text-slate-400">of {summary.total} persisted goals</span>
        </div>

        <div className="card-base p-4 border border-slate-200 shadow-soft">
          <span className="text-xs text-slate-500 block">Pending Tasks</span>
          <div className="text-2xl font-black text-slate-700 mt-1">
            {summary.pending}
          </div>
          <span className="text-[11px] text-slate-400">in your active queue</span>
        </div>

        <div className="card-base p-4 border border-slate-200 shadow-soft">
          <span className="text-xs text-slate-500 block">Overdue Tasks</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {summary.overdue}
          </div>
          <span className="text-[11px] text-slate-400">missed target deadline</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card-base p-12 text-center border border-slate-200 shadow-soft space-y-3">
          <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Goals in this Category</h3>
          <p className="text-xs text-slate-500">
            Click "Add Custom Goal" above to create milestones for your placement preparation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isOverdue = !task.is_completed && task.deadline && new Date(task.deadline) < new Date();

            return (
              <div
                key={task.id}
                className={`card-base p-4 sm:p-5 border transition-all flex items-start justify-between gap-4 ${
                  task.is_completed
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : isOverdue
                    ? 'bg-white border-rose-300 shadow-2xs'
                    : 'bg-white border-slate-200 shadow-soft hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                    aria-label={task.is_completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.is_completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {task.category}
                      </span>
                      {task.priority && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority} Priority
                        </span>
                      )}
                    </div>

                    <h4 className={`text-sm font-bold ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      {task.deadline && (
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-semibold' : ''}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                          {isOverdue && <span>(Overdue)</span>}
                        </span>
                      )}
                      {task.completed_at && (
                        <span className="text-emerald-700 font-medium">
                          Completed: {new Date(task.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Placement Goal</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="input-base text-xs py-2"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input-base text-xs py-2"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal / Topic Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Solve 20 Dynamic Programming problems on LeetCode"
                  className="input-base text-xs py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Practice Notes</label>
                <textarea
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="e.g. Focus on 0/1 Knapsack, Coin Change, and Longest Common Subsequence..."
                  className="input-base text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="input-base text-xs py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-4">
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
