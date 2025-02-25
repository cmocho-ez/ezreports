import { Router } from "express";
import { resolve, join } from "node:path";

import multer from "multer";

import UploadCtrl from "../controllers/api/upload.js";
import DeleteMediaCtrl from "../controllers/api/deletemedia.js";

const router = Router();
const uploader = multer({ dest: resolve(join(process.cwd(), process.env.UPLOAD_FILES_DEST)) });

router.post("/upload", uploader.single("file"), UploadCtrl);
router.delete("/deletemedia", DeleteMediaCtrl);

export default router;
