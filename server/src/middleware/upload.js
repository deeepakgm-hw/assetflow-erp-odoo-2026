const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Target uploads directory under server/src/uploads
const uploadDir = path.join(__dirname, "../uploads");

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common images and document formats
  const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt/;
  const allowedMimeTypes = /image\/|application\/pdf|application\/msword|application\/vnd.openxmlformats-officedocument|text\//;

  const extName = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedMimeTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  }
  
  cb(new Error("Error: Only images and document files (PDF, Word, Excel, CSV, Text) are allowed!"));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter
});

module.exports = upload;
