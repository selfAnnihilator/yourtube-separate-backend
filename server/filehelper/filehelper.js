"use strict";
import multer from "multer";

const storage = multer.memoryStorage();
const filefilter = (req, file, cb) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: filefilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});
export default upload;
