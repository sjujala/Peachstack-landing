import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
const resend = new Resend('re_hDVQdpBc_MCtewQMYAF6TnFb4p9Av2o2R');
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = req.body || {};
  const rows = Object.entries(body).map(([k,v])=>`<tr><td><b>${k}</b></td><td>${String(v||'')}</td></tr>`).join('');
  await resend.emails.send({ from: 'onboarding@resend.dev', to: 'peachstackadmin@gmail.com', subject: 'New Employer Signup - Peachstack', html: `<h2>New Employer Signup</h2><table>${rows}</table>` });
  return res.status(200).json({ success: true });
}
