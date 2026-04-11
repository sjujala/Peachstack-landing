import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_hDVQdpBc_MCtewQMYAF6TnFb4p9Av2o2R');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, lastName, birthday, email, university, major, year, skills, bio } = req.body || {};

  const yearLabel: Record<string, string> = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'peachstackadmin@gmail.com',
      subject: 'New Student Signup - Peachstack',
      html: `<div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#f97316">New Student Signup</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Name</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${firstName || ''} ${lastName || ''}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Email</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${email || 'N/A'}</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Birthday</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${birthday || 'N/A'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>University</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${university || 'N/A'}</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Major</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${major || 'N/A'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Year</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${yearLabel[year] || year || 'N/A'}</td></tr>
          <tr style="background:#f3f4f6"><td style="padding:8px;border:1px solid #e5e7eb"><strong>Skills</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${Array.isArray(skills) ? skills.join(', ') : (skills || 'N/A')}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb"><strong>Bio</strong></td><td style="padding:8px;border:1px solid #e5e7eb">${bio || 'N/A'}</td></tr>
        </table>
      </div>`
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
