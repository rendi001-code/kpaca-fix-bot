import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (req.headers['x-api-key']!== process.env.API_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const { fixId, to, subject, html } = req.body;
  if (!fixId ||!to ||!subject ||!html) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const data = await resend.emails.send({
      from: 'KPCA Fix <kpaca-fix-bot.vercel.app>', // GANTI PAKE DOMAIN YG UDAH VERIF DI RESEND
      to: [to],
      subject: `[fixId:${fixId}] ${subject}`,
      html: html,
    });
    return res.status(200).json({ status: 'SENT', id: data.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
                                                                    }rendi001-code/kpaca-fix-bot
