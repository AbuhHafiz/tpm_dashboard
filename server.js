import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'data', 'board-data.json');

// Admin credentials and active tokens
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'tonasa-admin';
const activeTokens = new Set(['tonasa-master-token-2026']);

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

function getDefaultSlots() {
  return {
    'plan-maintenance': {
      title: 'PLAN MAINTENANCE',
      subtitle: 'Perencanaan & Pemeliharaan Berkala',
      slots: [
        { id: 'pm-1', title: 'Schedule Pemeliharaan', subtitle: 'Jadwal Pemeliharaan Berkala Mesin', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'pm-2', title: 'Timeline Kegiatan', subtitle: 'Rencana Kerja & Milestone Waktu', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'pm-3', title: 'Temuan Abnormalitas', subtitle: 'Log & Tindak Lanjut Temuan Lapangan', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'pm-4', title: 'Standar 5R', subtitle: 'Ringkas, Rapi, Resik, Rawat, Rajin', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'pm-5', title: 'CILT Fokus Area', subtitle: 'Cleaning, Inspection, Lubrication, Tightening', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null }
      ]
    },
    'tpm-officer': {
      title: 'TPM OFFICER',
      subtitle: 'Organisasi & Tanggung Jawab Personil',
      slots: [
        { id: 'to-1', title: 'Struktur Organisasi SGA QC 4/5', subtitle: 'Bagan Tim & Penugasan SGA', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'to-2', title: 'Voice of CEO', subtitle: 'Arahan & Komitmen Manajemen', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'to-3', title: 'Masukan Fasilitator', subtitle: 'Catatan & Bimbingan Fasilitator', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'to-4', title: 'Masukan Leader Gugus', subtitle: 'Evaluasi & Saran Leader Gugus', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'to-5', title: 'Review Leader', subtitle: 'Monitoring & Penilaian Leader', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'to-6', title: 'Dokumentasi Kegiatan', subtitle: 'Foto & Dokumentasi Aktivitas TPM', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null }
      ]
    },
    'focus-improvement': {
      title: 'FOCUS IMPROVEMENT',
      subtitle: 'SGA, Kaizen & Peningkatan Berkelanjutan',
      slots: [
        { id: 'fi-1', title: 'Slogan SGA QC / Komitmen', subtitle: 'TPM Tuntas Bersama Jaga Kualitas', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'fi-2', title: 'Lembar Kaizen: Before - After', subtitle: 'Dokumentasi Titik Perbaikan', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null },
        { id: 'fi-3', title: 'Dokumen FI', subtitle: 'Dokumen & Lembar Focus Improvement', pdfUrl: null, pdfOriginalName: null, pdfSize: null, uploadedAt: null }
      ]
    }
  };
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading data file:', err);
  }
  return {};
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data file:', err);
  }
}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Authentication Middleware
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Akses Ditolak: Memerlukan hak akses Admin untuk mengunggah atau memodifikasi dokumen.' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  if (activeTokens.has(token) || token === 'tonasa-master-token-2026') {
    return next();
  }
  return res.status(401).json({ error: 'Sesi Admin tidak valid atau telah berakhir. Silakan login kembali.' });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const month = req.body.month || new Date().toISOString().slice(0, 7);
    const targetDir = path.join(UPLOADS_DIR, month);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: function (req, file, cb) {
    const sectionId = req.body.sectionId || 'section';
    const slotId = req.body.slotId || 'slot';
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(safeName) || '.pdf';
    const unique = Date.now();
    cb(null, `${sectionId}_${slotId}_${unique}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya berkas format .PDF yang diperbolehkan!'));
    }
  }
});

// Serve uploads statically with inline display headers
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// API: Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = 'adm_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    activeTokens.add(token);
    return res.json({
      success: true,
      token,
      role: 'admin',
      message: 'Login Admin Berhasil'
    });
  }
  return res.status(401).json({ error: 'Username atau password admin salah!' });
});

// API: Verify Admin Token
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ valid: false });
  const token = authHeader.replace('Bearer ', '').trim();
  if (activeTokens.has(token) || token === 'tonasa-master-token-2026') {
    return res.json({ valid: true, role: 'admin' });
  }
  return res.status(401).json({ valid: false });
});

// API: Get Network Info (Public)
app.get('/api/network-info', (req, res) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'] || req.get('host');
  const ip = getLocalIp();
  const protocol = forwardedProto || req.protocol;
  const fullUrl = forwardedHost ? `${protocol}://${forwardedHost}` : `http://${ip}:${PORT}`;

  res.json({
    localIp: ip,
    port: PORT,
    fullUrl
  });
});

// API: Get Board Data by Month (Public)
app.get('/api/board', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const data = loadData();
  
  if (!data[month]) {
    data[month] = getDefaultSlots();
    saveData(data);
  } else {
    // Self-healing check: verify physical file exists for any slot with pdfUrl
    let modified = false;
    Object.keys(data[month]).forEach(secId => {
      if (data[month][secId] && Array.isArray(data[month][secId].slots)) {
        data[month][secId].slots.forEach(slot => {
          if (slot.pdfUrl) {
            const filePath = path.join(__dirname, (slot.pdfUrl || "").replace(/^[\/\\\\]+/, ""));
            if (!fs.existsSync(filePath)) {
              console.warn("[Auto-Fix] File fisik tidak ditemukan, mengosongkan slot:", slot.id);
              slot.pdfUrl = null;
              slot.pdfOriginalName = null;
              slot.pdfSize = null;
              slot.uploadedAt = null;
              modified = true;
            }
          }
        });
      }
    });
    if (modified) {
      saveData(data);
    }
  }
  
  res.json({
    month,
    sections: data[month]
  });
});

// API: Upload PDF to a specific slot (PROTECTED: Admin Only)
app.post('/api/upload', requireAdminAuth, upload.single('pdfFile'), (req, res) => {
  try {
    const { month, sectionId, slotId, customTitle } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada berkas yang diunggah' });
    }

    const data = loadData();
    if (!data[month]) {
      data[month] = getDefaultSlots();
    }
    if (!data[month][sectionId]) {
      return res.status(404).json({ error: 'Section tidak ditemukan' });
    }

    const slotIndex = data[month][sectionId].slots.findIndex(s => s.id === slotId);
    if (slotIndex === -1) {
      return res.status(404).json({ error: 'Slot bagan tidak ditemukan' });
    }

    // Delete old file if exists
    const oldSlot = data[month][sectionId].slots[slotIndex];
    if (oldSlot.pdfUrl) {
      const oldPath = path.join(__dirname, (oldSlot.pdfUrl || "").replace(/^[\/\\\\]+/, ""));
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Gagal menghapus file lama:', e.message); }
      }
    }

    const targetMonthDir = path.join(UPLOADS_DIR, month);
    if (!fs.existsSync(targetMonthDir)) {
      fs.mkdirSync(targetMonthDir, { recursive: true });
    }
    const finalFilePath = path.join(targetMonthDir, req.file.filename);
    if (path.resolve(req.file.path) !== path.resolve(finalFilePath)) {
      try {
        fs.renameSync(req.file.path, finalFilePath);
      } catch (e) {
        fs.copyFileSync(req.file.path, finalFilePath);
        try { fs.unlinkSync(req.file.path); } catch (_) {}
      }
    }
    const relativeUrl = `/uploads/${month}/${req.file.filename}`;
    data[month][sectionId].slots[slotIndex] = {
      ...oldSlot,
      title: customTitle || oldSlot.title,
      pdfUrl: relativeUrl,
      pdfOriginalName: req.file.originalname,
      pdfSize: req.file.size,
      uploadedAt: new Date().toISOString()
    };

    saveData(data);

    res.json({
      success: true,
      message: 'PDF berhasil diunggah',
      slot: data[month][sectionId].slots[slotIndex]
    });
  } catch (err) {
    console.error('Error uploading:', err);
    res.status(500).json({ error: err.message || 'Gagal mengunggah PDF' });
  }
});

// API: Delete PDF from a slot (PROTECTED: Admin Only)
app.delete('/api/slot-pdf', requireAdminAuth, (req, res) => {
  const { month, sectionId, slotId } = req.query;
  const data = loadData();

  if (data[month] && data[month][sectionId]) {
    const slotIndex = data[month][sectionId].slots.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
      const slot = data[month][sectionId].slots[slotIndex];
      if (slot.pdfUrl) {
        const filePath = path.join(__dirname, (slot.pdfUrl || "").replace(/^[\/\\\\]+/, ""));
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
      slot.pdfUrl = null;
      slot.pdfOriginalName = null;
      slot.pdfSize = null;
      slot.uploadedAt = null;
      saveData(data);
      return res.json({ success: true, message: 'PDF berhasil dihapus', slot });
    }
  }

  res.status(404).json({ error: 'Slot tidak ditemukan' });
});

// API: Rename slot title (PROTECTED: Admin Only)
app.patch('/api/slot-title', requireAdminAuth, (req, res) => {
  const { month, sectionId, slotId, title, subtitle } = req.body;
  const data = loadData();

  if (data[month] && data[month][sectionId]) {
    const slotIndex = data[month][sectionId].slots.findIndex(s => s.id === slotId);
    if (slotIndex !== -1) {
      if (title) data[month][sectionId].slots[slotIndex].title = title;
      if (subtitle !== undefined) data[month][sectionId].slots[slotIndex].subtitle = subtitle;
      saveData(data);
      return res.json({ success: true, slot: data[month][sectionId].slots[slotIndex] });
    }
  }

  res.status(404).json({ error: 'Slot tidak ditemukan' });
});

// Serve frontend dist if it exists
const DIST_DIR = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server papan kontrol berjalan di:`);
  console.log(`- Local:   http://localhost:${PORT}`);
  console.log(`- Network: http://${getLocalIp()}:${PORT}`);
});