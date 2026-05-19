import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/app-error.js";

const profileUploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
const postUploadDir = path.join(process.cwd(), "public", "uploads", "posts");

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const profileMaxFileSize = 2 * 1024 * 1024;
const postMaxFileSize = 5 * 1024 * 1024;

const createImageStorage = (uploadDir, prefix) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const safeName = `${req.userId}-${prefix}-${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
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
  storage: createImageStorage(profileUploadDir, "profile"),
  fileFilter,
  limits: {
    fileSize: profileMaxFileSize,
    files: 2
  }
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover", maxCount: 1 }
]);

export const postMediaUpload = multer({
  storage: createImageStorage(postUploadDir, "post"),
  fileFilter,
  limits: {
    fileSize: postMaxFileSize,
    files: 4
  }
}).array("media", 4);
