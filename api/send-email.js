import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // biar gak CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 1. Cek API Key
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ success: false, message: 'Unauthorized: API Key salah' });
    }

    // 2. Ambil body
    const { to_email, subject, body, sender, pass } = req.body;
    if (!to_email || !subject || !body || !sender || !pass) {
      return res.status(400).json({ success: false, message: 'Data kurang lengkap' });
    }

    // 3. Buat transporter gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: sender, 
        pass: pass // WAJIB APP PASSWORD
      }
    });

    // 4. Kirim email
    await transporter.sendMail({
      from: `"KPCA FIX RED" <${sender}>`,
      to: to_email,
      subject: subject, // contoh: "FIX MERAH - KPCA-4820-1937-4651"
      text: body,
      html: `<pre style="font-family:monospace; white-space:pre-wrap">${body}</pre>`
    });

    // 5. Sukses
    return res.status(200).json({ 
      success: true, 
      message: `Email berhasil dikirim ke ${to_email}`
    });

  } catch (error) {
    console.error('ERROR:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal kirim email: ' + error.message 
    });
  }
}
