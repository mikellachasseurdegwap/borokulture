import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/app-error.js";

const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
fs.mkdirSync(uploadDir, { recursive: true });

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${req.userId}-${file.fieldname}-${Date.now()}${extension}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new AppError("Image format must be jpg, png, or webp", 400));
    return;
  }

  cb(null, true);
};

export const profileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 2
  }
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover", maxCount: 1 }
]);
