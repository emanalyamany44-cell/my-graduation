const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});
