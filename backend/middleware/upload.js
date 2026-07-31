const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/lands directory exists
const uploadDir = path.join(__dirname, '../uploads/lands');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  
  const isValidExt = allowedTypes.test(ext);
  const isValidMime = allowedTypes.test(mimeType);
  
  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and WebP images are allowed!'), false);
  }
};

// Multer upload middleware configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
  }
});

module.exports = upload;
