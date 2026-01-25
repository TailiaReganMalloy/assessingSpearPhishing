import { Router } from "express";

import { listMessages } from "../controllers/messageController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/messages", requireAuth, listMessages);

export default router;
