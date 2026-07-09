import axios from 'axios';
import fs from 'fs';
import path from 'path';

// fungsi buat baca DB lu
const readDb = (file) => {
  const filePath = path.join(process.cwd(), 'db', file); // sesuain folder db lu
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const MT_FILE = 'mt.json'; // file template setmt
const SETTINGS_DB = 'settings.json'; // file active_mt_id

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body; // data dari form

  if (!name ||!email ||!message) {
    return res.status(400).json({ message: 'Data kurang lengkap' });
  }

  try {
    // 1. AMBIL TEMPLATE AKTIF DARI SETMT
    const set = readDb(SETTINGS_DB);
    const mtList = readDb(MT_FILE);
    const activeId = set.active_mt_id?? -1;
    const mt = mtList[activeId];

    if (!mt) {
      return res.status(500).json({ message: 'Template MT belum diset. Pakai /setmt dulu di bot' });
    }

    // 2. GANTI {nomor} JADI NAMA PENGIRIM
    const isiEmail = mt.body.replace(/{nomor}/g, name);

    // 3. KIRIM PAKE BREVO
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: {
        name: 'KPCA Fix',
        email: 'kpcafix@sendinblue.com' // nanti ganti domain
      },
      to: [{ email: mt.tujuan }], // TUJUAN AMBIL DARI SETMT
      subject: mt.subject, // SUBJEK AMBIL DARI SETMT
      htmlContent: `
        <h3>Pesan Baru dari Website</h3>
        <p><b>Dari:</b> ${name} - ${email}</p>
        <hr>
        <p>${isiEmail.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><i>Pesan asli: ${message}</i></p>
      `
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return res.status(200).json({ success: true, message: 'Email terkirim via template aktif' });

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Gagal kirim email' });
  }
      }
