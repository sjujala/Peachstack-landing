import { motion } from 'motion/react';
import { MOCK_PROJECTS } from '../constants';
import { Search, Filter, Plus, Briefcase, Users, BarChart3, Clock, DollarSign, ChevronRight, Building2, ShieldCheck, Zap, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useMemo, FormEvent } from 'react';
import Modal from '../components/ui/Modal';
import { toast } from 'sonner';
import { Project } from '../types';

export default function EmployerDashboard() {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    type: 'Market Audit' as Project['type'],
    compensation: '',
    duration: '',
    skills: ''
  });

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const handlePostProject = (e: FormEvent) => {
    e.preventDefault();
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: newProject.title,
      company: 'Your Company',
      description: newProject.description,
      type: newProject.type,
      status: 'Open',
      compensation: newProject.compensation,
      duration: newProject.duration,
      skills: newProject.skills.split(',').map(s => s.trim())
    };
    setProjects([project, ...projects]);
    setIsPostModalOpen(false);
    setNewProject({ title: '', description: '', type: 'Market Audit', compensation: '', duration: '', skills: '' });
    toast.success('Project posted successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: 'Active Projects', value: projects.length.toString(), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Matches', value: '148', icon: Users, color: 'text-peach-600', bg: 'bg-peach-50' },
            { label: 'Avg. Project ROI', value: '4.2x', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat, i) => (
            <div key={i} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <p className="mt-1 text-3xl font-extrabold text-slate-900">{stat.value}</p>
                </div>
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={28} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Main Content: Projects List */}
          <div className="flex-grow space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl font-bold text-slate-900">Your Projects</h2>
              <button 
                onClick={() => setIsPostModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-peach-500 px-6 py-3 font-bold text-white shadow-lg shadow-peach-100 transition-all hover:bg-peach-600 active:scale-95"
              >
                <Plus size={20} />
                Post New Project
              </button>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                />
              </div>
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                <Filter size={18} />
                Filters
              </button>
            </div>

            <div className="space-y-4">
              {filteredProjects.length > 0 ? filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:shadow-md"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 group-hover:bg-peach-500 group-hover:text-white transition-colors">
                        <Zap size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{project.title}</h3>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                            project.status === 'Open' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                          )}>
                            {project.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-1">{project.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.skills.map((skill, i) => (
                            <span key={i} className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 sm:border-0 sm:pt-0">
                      <div className="flex gap-6 sm:mr-8">
                        <div className="text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</p>
                          <p className="text-sm font-bold text-slate-900">{project.compensation.split(' ')[0]}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
                          <p className="text-sm font-bold text-slate-900">{project.duration}</p>
                        </div>
                      </div>
                      <button className="rounded-xl bg-slate-50 p-3 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                    <Search size={32} />
                  </div>
                  <h3 className="mt-4 font-bold text-slate-900">No projects found</h3>
                  <p className="mt-2 text-sm text-slate-500">Try adjusting your search query.</p>
                </div>
              )}
            </div>
          </div>

          {/* Post Project Modal */}
          <Modal
            isOpen={isPostModalOpen}
            onClose={() => setIsPostModalOpen(false)}
            title="Post a New Project"
          >
            <form onSubmit={handlePostProject} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Project Title</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Market Competitor Audit"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Type</label>
                  <select
                    value={newProject.type}
                    onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                  >
                    <option>Market Audit</option>
                    <option>Data Cleanup</option>
                    <option>Social Media</option>
                    <option>Research</option>
                    <option>Strategy</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Budget</label>
                  <input
                    type="text"
                    value={newProject.compensation}
                    onChange={(e) => setNewProject(prev => ({ ...prev, compensation: e.target.value }))}
                    placeholder="e.g. $500 Stipend"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Skills (comma separated)</label>
                <input
                  type="text"
                  value={newProject.skills}
                  onChange={(e) => setNewProject(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="e.g. Excel, Research, Analysis"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20"
                  required
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-peach-500 py-4 font-bold text-white shadow-lg shadow-peach-100 transition-all hover:bg-peach-600 active:scale-95"
              >
                <Save size={20} />
                Post Project
              </button>
            </form>
          </Modal>

          {/* Sidebar: Talent Matches */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-bold text-slate-900">Top Matches</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-peach-500 text-[10px] font-bold text-white">
                  24
                </span>
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://picsum.photos/seed/talent${i}/100/100`}
                        alt="Talent"
                        className="h-12 w-12 rounded-xl object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-peach-500">Talent #{i}482</p>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                            <ShieldCheck size={12} />
                            Vetted
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">Stanford • Econ Major</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-1">
                      <div className="h-1 flex-grow rounded-full bg-slate-100">
                        <div className="h-full w-[90%] rounded-full bg-peach-500" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">90% Match</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-8 w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50">
                View All Talent
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-peach-400 mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="font-display text-lg font-bold">Employer Insights</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Your projects are getting 24% more engagement than the platform average.
              </p>
              <button className="mt-6 w-full rounded-xl bg-peach-500 py-3 text-sm font-bold transition-all hover:bg-peach-600">
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
