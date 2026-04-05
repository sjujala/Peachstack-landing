import { motion } from 'motion/react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-12"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-2xl bg-peach-50 text-peach-600 flex items-center justify-center shadow-sm">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Last Updated: March 24, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <Eye className="text-peach-500" size={24} />
                1. Information We Collect
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We collect information that you provide directly to us when you create an account, update your profile, or communicate with us. This includes:
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  'Personal Information: Name, email address, and contact details.',
                  'Academic Information: University, major, and graduation year.',
                  'Professional Data: Skills, badges earned, and project outcomes.',
                  'Company Data: For employers, we collect company name and project briefs.'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <Lock className="text-peach-500" size={24} />
                2. How We Use Your Information
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, including:
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  'Matching students with appropriate corporate projects.',
                  'Verifying skills and awarding badges.',
                  'Facilitating communication between students and employers.',
                  'Sending technical notices, updates, and security alerts.'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <FileText className="text-peach-500" size={24} />
                3. Data Security
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. All sensitive data is encrypted at rest and in transit.
              </p>
            </section>

            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Questions?</h3>
              <p className="text-slate-600 text-sm">
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:PeachStackAdmin@gmail.com" className="text-peach-600 font-bold hover:underline">PeachStackAdmin@gmail.com</a>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
