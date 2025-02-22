import { Router } from "express";
import multer from "multer";

import UploadCtrl from "../controllers/api/upload.js";

const router = Router();
const uploader = multer({ dest: process.env.UPLOAD_FILES_DEST });

router.post("/upload", uploader.single("file"), UploadCtrl);

export default router;
