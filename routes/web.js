import { Router } from "express";

import WebCommon from "../middleware/web_common.js";

import HomeCtrl from "../controllers/web/home.js";
import MediaCtrl from "../controllers/web/media.js";
import EditorCtrl from "../controllers/web/editor.js";
import ViewerCtrl from "../controllers/web/viewer.js";
import TenantCtrl from "../controllers/web/tenant.js";

const router = Router();

router.use(WebCommon);

router.get("/", HomeCtrl);
router.get("/viewer", ViewerCtrl);
router.get("/viewer/:uid", ViewerCtrl);
router.get("/editor", EditorCtrl);
router.get("/editor/:uid", EditorCtrl);
router.get("/media", MediaCtrl);
router.get("/tenant", TenantCtrl);

export default router;
