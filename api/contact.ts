import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_hDVQdpBc_MCtewQMYAF6TnFb4p9Av2o2R');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message, subject } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'peachstackadmin@gmail.com',
      subject: `New Contact Form: ${subject || 'General Inquiry'}`,
      html: `<div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#f97316">New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Name</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Email</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${email}</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Subject</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${subject || 'N/A'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Message</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${message}</td></tr>
        </table>
      </div>`
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
