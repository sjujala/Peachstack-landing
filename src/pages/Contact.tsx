import { motion } from 'motion/react';
import { Mail, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Contact() {
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
              Whether you're a student looking to launch your career or an employer seeking top talent, we're here to help. Reach out directly and we'll get back to you.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm", "bg-blue-50 text-blue-600")}>
                  <Mail size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email Us</h3>
                  <a
                    href="mailto:peachstackadmin@gmail.com"
                    className="text-peach-500 font-medium hover:underline"
                  >
                    peachstackadmin@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <MessageSquare size={20} className="text-peach-400" />
                  Response Time
                </h4>
                <p className="text-slate-400 text-sm mb-6">Our team reviews emails Monday – Friday. We aim to respond within 1–2 business days.</p>
                <div className="flex items-center gap-2 text-xs font-bold text-green-400">
                  <CheckCircle2 size={14} />
                  Average response time: 24 hours
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-peach-500/10 blur-2xl" />
            </div>
          </motion.div>

          {/* Right Side: Email CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 lg:p-12 flex flex-col items-center justify-center text-center"
          >
            <div className="h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-8">
              <Mail size={40} />
            </div>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-4">Send us an email</h2>
            <p className="text-slate-600 mb-8 leading-relaxed max-w-sm">
              Have a question, partnership inquiry, or just want to say hello? Drop us a line and we'll get back to you shortly.
            </p>
            <a
              href="mailto:peachstackadmin@gmail.com"
              className="flex items-center justify-center gap-2 rounded-xl bg-peach-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-peach-100 transition-all hover:bg-peach-600 active:scale-95 w-full"
            >
              <Mail size={20} />
              peachstackadmin@gmail.com
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

