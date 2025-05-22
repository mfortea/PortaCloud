const multer = require('multer');
const path = require('path');
const fs = require('fs');

const tempUploadsDir = path.resolve(__dirname, '..', 'temp_uploads');

// Asegurarse que la carpeta temporal exista
if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadsDir);
  },
  filename: (req, file, cb) => {
    // Crear nombre único para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // límite 10MB

module.exports = upload;
