const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Common file filter for both upload instances
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only video files are allowed (MP4, MOV, AVI, MKV, WEBM)"),
      false
    );
  }
};

// 1. Course Videos Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/course-videos");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

// 2. Company Contents Storage
const companyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/company-contents");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

// Create two separate upload instances
const uploadCourseVideo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB limit
  },
});

const uploadCompanyContent = multer({
  storage: companyStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB limit
  },
});

// Export both upload instances
module.exports = {
  uploadCourseVideo,
  uploadCompanyContent,
};
