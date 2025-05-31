const multer = require("multer");
const path = require("path");
const fs = require("fs");

let isVideo;
let isDocument;

const fileFilter = (req, file, cb) => {
  const typeCategories = {
    video: [
      "video/mp4",
      "video/quicktime", // MOV
      "video/x-msvideo", // AVI
      "video/x-matroska", // MKV
      "video/webm",
    ],
    document: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "application/rtf",
    ],
  };

  isVideo = typeCategories.video.includes(file.mimetype);
  isDocument = typeCategories.document.includes(file.mimetype);

  if (isVideo || isDocument) {
    // Attach file type to request for later use
    req.fileType = isVideo ? "video" : "document";
    cb(null, true);
  } else {
    const allowedFormats = [
      ...typeCategories.video.map((v) => v.split("/")[1]),
      ...typeCategories.document.map((d) => d.split("/").pop()),
    ].join(", ");

    cb(
      new Error(`Unsupported file type. Allowed formats: ${allowedFormats}`),
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
    if (isVideo) cb(null, `video-${uniqueSuffix}${ext}`);
    if (isDocument) cb(null, `document-${uniqueSuffix}${ext}`);
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
    if (isVideo) cb(null, `video-${uniqueSuffix}${ext}`);
    if (isDocument) cb(null, `document-${uniqueSuffix}${ext}`);
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
