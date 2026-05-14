const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads folder if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'video' && file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else if (file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, file.mimetype.startsWith('video/'));
    } else if (file.fieldname === 'thumbnail') {
      cb(null, file.mimetype.startsWith('image/'));
    } else {
      cb(null, false);
    }
  }
});

module.exports = upload;