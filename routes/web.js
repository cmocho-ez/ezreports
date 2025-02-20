import { Router } from "express";

import HomeCtrl from "../controllers/home.js";
import MediaCtrl from "../controllers/media.js";
import EditorCtrl from "../controllers/editor.js";
import ViewerCtrl from "../controllers/viewer.js";
import TenantCtrl from "../controllers/tenant.js";

const router = Router();

router.get("/", HomeCtrl);
router.get("/viewer", ViewerCtrl);
router.get("/viewer/:uid", ViewerCtrl);
router.get("/editor", EditorCtrl);
router.get("/editor/:uid", EditorCtrl);
router.get("/media", MediaCtrl);
router.get("/tenant", TenantCtrl);

export default router;
