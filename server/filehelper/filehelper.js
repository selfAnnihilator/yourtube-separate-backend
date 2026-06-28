"use strict";
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = process.env.UPLOAD_DIR || "uploads";

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});
const filefilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: filefilter });
export default upload;
