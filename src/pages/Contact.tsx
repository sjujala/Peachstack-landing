import { motion } from 'motion/react';
import { Mail, Send, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Student Inquiry',
    message: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Message sent! We will get back to you within 24 hours.');
      setName(''); setEmail(''); setSubject('Student Inquiry'); setMessage('');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left Side: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-peach-50 px-4 py-1.5 text-sm font-bold text-peach-600 mb-6">
              <Sparkles size={16} />
              <span>Get in Touch</span>
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-slate-900 mb-8">
              Let's build your <span className="text-peach-500 italic">stack</span> together.
            </h1>
            <p className="text-lg text-slate-600 mb-12 leading-relaxed">
              Whether you're a student looking to launch your career or an employer seeking top talent, we're here to help.
            </p>

            <div className="space-y-8">
              {[
                { icon: Mail, title: 'Email Us', desc: 'PeachStackAdmin@gmail.com', color: 'bg-blue-50 text-blue-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm", item.color)}>
                    <item.icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <MessageSquare size={20} className="text-peach-400" />
                  Live Support
                </h4>
                <p className="text-slate-400 text-sm mb-6">Our support team is available Monday - Friday, 9am - 6pm EST.</p>
                <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                  <CheckCircle2 size={14} />
                  Average response time: 2 hours
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-peach-500/10 blur-2xl" />
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 lg:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Subject</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                >
                  <option value="Student Inquiry">Student Inquiry</option>
                  <option value="Employer Partnership">Employer Partnership</option>
                  <option value="Media Inquiry">Media Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Message</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="How can we help you?"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-peach-500 focus:outline-none focus:ring-2 focus:ring-peach-500/20 transition-all"
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-peach-500 py-4 font-bold text-white shadow-lg shadow-peach-100 transition-all hover:bg-peach-600 active:scale-95"
              >
                Send Message
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
