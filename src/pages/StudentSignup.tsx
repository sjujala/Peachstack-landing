import { motion } from 'motion/react';
import { User, Mail, GraduationCap, BookOpen, ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Plus, X } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import Autocomplete from '../components/Autocomplete';
import { colleges } from '../data/collegeData';
import { majors } from '../data/majorData';

export default function StudentSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    email: '',
    university: '',
    major: '',
    year: '1',
    additionalAcademicDetails: [] as { name: string, type: 'Major' | 'Minor' }[],
    whyOpportunity: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/student-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Application submitted successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-slate-100"
        >
          <div className="mx-auto h-24 w-24 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-6">Thank you for signing up!</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            Our team will review your application and reach out to you with your login credentials shortly. 
            Keep an eye on your email!
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        {/* Left Side: Info */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-peach-500 text-white mb-8">
              <Sparkles size={24} />
            </div>
            <h2 className="font-display text-4xl font-bold mb-6">Start Building Your Stack.</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              Join 500+ students who are already learning industry tools and matching with top corporate projects.
            </p>
            <div className="space-y-6">
              {[
                { title: 'Verified Skills', desc: 'Earn badges for Excel, CRM, and Logic.' },
                { title: 'Paid Projects', desc: 'Get matched with real corporate audits.' },
                { title: 'Career Network', desc: 'Connect with mentors from top firms.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-peach-500/20 text-peach-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/s${i}/40/40`} className="h-8 w-8 rounded-full border-2 border-slate-900" alt="Student" />
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium">Trusted by students from Stanford, Harvard, and LSE.</p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-peach-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        {/* Right Side: Form */}
        <div className="p-8 lg:p-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("h-1 flex-grow rounded-full transition-all", step >= 1 ? "bg-peach-500" : "bg-slate-100")} />
              <span className={cn("h-1 flex-grow rounded-full transition-all", step >= 2 ? "bg-peach-500" : "bg-slate-100")} />
              <span className={cn("h-1 flex-grow rounded-full transition-all", step >= 3 ? "bg-peach-500" : "bg-slate-100")} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              {step === 1 ? 'Create Your Account' : step === 2 ? 'Academic Details' : 'Your Story'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {step === 1 ? 'Enter your basic information to get started.' : step === 2 ? 'Tell us about your university journey.' : 'Why should we choose you?'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        placeholder="John"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Doe"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Birthday</label>
                  <input
                    type="date"
                    required
                    value={formData.birthday}
                    onChange={e => setFormData({...formData, birthday: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="john@university.edu"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <Autocomplete
                  options={colleges}
                  value={formData.university}
                  onChange={value => setFormData({...formData, university: value})}
                  label="University"
                  placeholder="Search for your university..."
                  icon={<GraduationCap size={18} />}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Autocomplete
                    options={majors}
                    value={formData.major}
                    onChange={value => setFormData({...formData, major: value})}
                    label="Major"
                    placeholder="Search for your major..."
                    icon={<BookOpen size={18} />}
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Year</label>
                    <select
                      value={formData.year}
                      onChange={e => setFormData({...formData, year: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                {/* Additional Majors/Minors */}
                <div className="space-y-4">
                  {formData.additionalAcademicDetails.map((detail, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 items-end"
                    >
                      <div className="flex-grow">
                        <Autocomplete
                          options={majors}
                          value={detail.name}
                          onChange={value => {
                            const newDetails = [...formData.additionalAcademicDetails];
                            newDetails[index].name = value;
                            setFormData({...formData, additionalAcademicDetails: newDetails});
                          }}
                          label={`${detail.type} ${index + 1}`}
                          placeholder={`Search for your ${detail.type.toLowerCase()}...`}
                          icon={<BookOpen size={18} />}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Type</label>
                        <select
                          value={detail.type}
                          onChange={e => {
                            const newDetails = [...formData.additionalAcademicDetails];
                            newDetails[index].type = e.target.value as 'Major' | 'Minor';
                            setFormData({...formData, additionalAcademicDetails: newDetails});
                          }}
                          className="rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                        >
                          <option value="Major">Major</option>
                          <option value="Minor">Minor</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newDetails = formData.additionalAcademicDetails.filter((_, i) => i !== index);
                          setFormData({...formData, additionalAcademicDetails: newDetails});
                        }}
                        className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </motion.div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      additionalAcademicDetails: [...formData.additionalAcademicDetails, { name: '', type: 'Minor' }]
                    })}
                    className="flex items-center gap-2 text-sm font-bold text-peach-500 hover:text-peach-600 transition-colors"
                  >
                    <Plus size={16} />
                    Add Major/Minor
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Why should you be offered this opportunity?</label>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">
                      Tell us about yourself — why should you be offered this opportunity? Share what you've accomplished so far, any projects, leadership roles, or experiences that set you apart.
                    </p>
                    <textarea
                      required
                      rows={8}
                      value={formData.whyOpportunity}
                      onChange={e => setFormData({...formData, whyOpportunity: e.target.value})}
                      placeholder="Describe your accomplishments, leadership roles, and why you're a great fit..."
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-peach-500 py-4 font-bold text-white shadow-lg shadow-peach-100 transition-all hover:bg-peach-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {step < 3 ? 'Next Step' : 'Complete Signup'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Back to previous step
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Your data is encrypted and secure.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
