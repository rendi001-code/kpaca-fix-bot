import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    if (req.headers['x-api-key'] !== process.env.API_KEY) {
      return res.status(401).json({ success: false, message: 'API Key salah' });
    }

    const { to_email, subject, body, sender, pass } = req.body;
    if (!to_email || !subject || !body || !sender || !pass) {
      return res.status(400).json({ success: false, message: 'Data kurang lengkap' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: sender, pass: pass }
    });

    await transporter.sendMail({
      from: `"KPCA FIX RED" <${sender}>`,
      to: to_email,
      subject: subject,
      text: body
    });

    return res.status(200).json({ success: true, message: 'Email terkirim' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
  }
