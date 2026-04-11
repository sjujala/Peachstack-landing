import { motion } from 'motion/react';
import { ChevronRight, Rocket, Target, ShieldCheck, ArrowRight, Building2, Sparkles, Loader2 } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

const TOTAL_STEPS = 3;

export default function StudentSignup() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', birthday: '', email: '',
    university: '', major: '', year: '1', skills: [] as string[], bio: '',
  });

  const updateField = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) { setStep(step + 1); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/student-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed');
      setIsSubmitted(true);
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">You are on the list!</h2>
          <p className="text-gray-600 text-lg">We will reach out to you at <strong>{formData.email}</strong> when Peachstack launches.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gray-900 p-10 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mb-8">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Start Building Your Stack.</h1>
            <p className="text-gray-400 text-lg mb-8">Join 500+ students who are already learning industry tools and matching with top corporate projects.</p>
            <div className="space-y-4">
              {[
                { icon: Target, label: 'Verified Skills', desc: 'Earn badges for Excel, CRM, and Logic.' },
                { icon: Rocket, label: 'Paid Projects', desc: 'Get matched with real corporate audits.' },
                { icon: Building2, label: 'Career Network', desc: 'Connect with mentors from top firms.' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  </div>
                  <div><p className="text-white font-medium">{label}</p><p className="text-gray-400 text-sm">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2">
              {['s1','s2','s3'].map(s => <img key={s} src={`https://picsum.photos/seed/${s}/40/40`} alt="" className="w-8 h-8 rounded-full border-2 border-gray-900" />)}
            </div>
            <p className="text-gray-400 text-sm">Trusted by students from Stanford, Harvard, and LSE.</p>
          </div>
        </div>
        <div className="p-10 flex flex-col justify-center">
          <div className="flex gap-1 mb-8">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-300', i < step ? 'bg-orange-500' : 'bg-gray-200')} />
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div><h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2><p className="text-gray-500 text-sm mt-1">Enter your basic information to get started.</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label><input type="text" placeholder="John" value={formData.firstName} onChange={e => updateField('firstName', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label><input type="text" placeholder="Doe" value={formData.lastName} onChange={e => updateField('lastName', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label><input type="date" value={formData.birthday} onChange={e => updateField('birthday', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><input type="email" placeholder="john@university.edu" value={formData.email} onChange={e => updateField('email', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div><h2 className="text-2xl font-bold text-gray-900">Academic Details</h2><p className="text-gray-500 text-sm mt-1">Tell us about your university journey.</p></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">University</label><input type="text" placeholder="Search for your university..." value={formData.university} onChange={e => updateField('university', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Major</label><input type="text" placeholder="e.g. Computer Science" value={formData.major} onChange={e => updateField('major', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><select value={formData.year} onChange={e => updateField('year', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option></select></div>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div><h2 className="text-2xl font-bold text-gray-900">Your Profile</h2><p className="text-gray-500 text-sm mt-1">Tell us about your skills and interests.</p></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {['Excel','PowerPoint','SQL','Python','CRM','Finance','Marketing','Design'].map(skill => (
                      <button key={skill} type="button" onClick={() => { const skills = formData.skills.includes(skill) ? formData.skills.filter(s => s !== skill) : [...formData.skills, skill]; updateField('skills', skills); }} className={cn('px-3 py-1.5 rounded-full text-sm font-medium border transition-all', formData.skills.includes(skill) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300')}>{skill}</button>
                    ))}
                  </div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label><textarea placeholder="Tell us a bit about yourself..." value={formData.bio} onChange={e => updateField('bio', e.target.value)} rows={4} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" /></div>
              </motion.div>
            )}
            <div className="space-y-3">
              <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : step < TOTAL_STEPS ? <>Next Step <ArrowRight className="w-4 h-4" /></> : <>Complete Signup <ChevronRight className="w-4 h-4" /></>}
              </button>
              {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors">Back to previous step</button>}
            </div>
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" />Your data is encrypted and secure.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
