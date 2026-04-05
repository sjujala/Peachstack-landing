import { motion } from 'motion/react';
import { CheckCircle2, Clock, Briefcase, Calendar, ChevronRight, Layout, ListTodo, MessageSquare, Star, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  project: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

interface ActiveProject {
  id: string;
  title: string;
  company: string;
  progress: number;
  nextDeadline: string;
  tasksRemaining: number;
}

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Complete Market Research Audit', project: 'Goldman Sachs Audit', deadline: 'Today, 5 PM', priority: 'High', completed: false },
  { id: '2', title: 'Draft Executive Summary', project: 'Goldman Sachs Audit', deadline: 'Tomorrow', priority: 'Medium', completed: false },
  { id: '3', title: 'Clean Social Media Dataset', project: 'Nike Strategy', deadline: 'Mar 28', priority: 'High', completed: false },
  { id: '4', title: 'Submit Weekly Progress Report', project: 'Nike Strategy', deadline: 'Mar 29', priority: 'Low', completed: true },
];

const MOCK_ACTIVE_PROJECTS: ActiveProject[] = [
  { id: 'p1', title: 'Market Competitor Audit', company: 'Goldman Sachs', progress: 65, nextDeadline: 'Mar 26', tasksRemaining: 4 },
  { id: 'p2', title: 'Gen Z Brand Strategy', company: 'Nike', progress: 30, nextDeadline: 'Apr 02', tasksRemaining: 8 },
];

export default function Workspace() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const savedName = localStorage.getItem('peachstack_user_name');
    if (savedName) setUserName(savedName.split(' ')[0]);
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Welcome back, {userName}!</h1>
            <p className="text-slate-500">Here's what's on your stack for today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-peach-500">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Streak</p>
              <p className="text-lg font-bold text-slate-900">12 Days</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content: Tasks & Projects */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Projects Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Layout className="text-peach-500" size={20} />
                  Active Projects
                </h2>
                <button className="text-sm font-bold text-peach-600 hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {MOCK_ACTIVE_PROJECTS.map((project) => (
                  <motion.div
                    key={project.id}
                    whileHover={{ y: -4 }}
                    className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Briefcase size={20} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Due {project.nextDeadline}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{project.company}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-peach-600">{project.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div 
                          className="h-full rounded-full bg-peach-500 transition-all duration-500" 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                      <span className="text-xs font-medium text-slate-500">{project.tasksRemaining} tasks left</span>
                      <button className="text-xs font-bold text-slate-900 flex items-center gap-1 hover:text-peach-500">
                        Open Workspace <ChevronRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Tasks Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ListTodo className="text-peach-500" size={20} />
                  Your Tasks
                </h2>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-100 shadow-sm">All</button>
                  <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-400">Today</button>
                </div>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all",
                      task.completed ? "opacity-60 grayscale" : "hover:shadow-sm"
                    )}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                        task.completed 
                          ? "bg-green-500 border-green-500 text-white" 
                          : "border-slate-200 hover:border-peach-500"
                      )}
                    >
                      {task.completed && <CheckCircle2 size={14} />}
                    </button>
                    <div className="flex-grow">
                      <h4 className={cn("text-sm font-bold text-slate-900", task.completed && "line-through")}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500">{task.project}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-400">
                        <Clock size={14} />
                        {task.deadline}
                      </div>
                      <span className={cn(
                        "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                        task.priority === 'High' ? "bg-red-50 text-red-600" :
                        task.priority === 'Medium' ? "bg-amber-50 text-amber-600" :
                        "bg-blue-50 text-blue-600"
                      )}>
                        {task.priority}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar: Schedule & Updates */}
          <div className="space-y-8">
            {/* Calendar Widget */}
            <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="text-peach-500" size={18} />
                  Schedule
                </h2>
                <span className="text-xs font-bold text-slate-400">Mar 24</span>
              </div>
              <div className="space-y-6">
                {[
                  { time: '10:00 AM', event: 'Team Sync: Nike Strategy', type: 'Meeting' },
                  { time: '02:00 PM', event: 'Excel Workshop', type: 'Training' },
                  { time: '04:30 PM', event: 'Project Review', type: 'Review' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-16 pt-1">
                      {item.time}
                    </div>
                    <div className="flex-grow pb-4 border-l-2 border-slate-50 pl-4 relative">
                      <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-peach-500" />
                      <p className="text-sm font-bold text-slate-900">{item.event}</p>
                      <p className="text-xs text-slate-500">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100">
                Open Calendar
              </button>
            </section>

            {/* Recent Feedback */}
            <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <MessageSquare className="text-peach-400" size={18} />
                Recent Feedback
              </h2>
              <div className="mt-6 space-y-6">
                <div className="rounded-2xl bg-white/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-peach-400">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nike Strategy</span>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "Excellent attention to detail on the brand audit. The data visualization was particularly impressive."
                  </p>
                  <p className="mt-3 text-[10px] font-bold text-peach-400 uppercase">— Sarah M., Project Lead</p>
                </div>
              </div>
              <button className="mt-6 w-full rounded-xl bg-white/10 py-3 text-xs font-bold hover:bg-white/20">
                View All Feedback
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
