import { Router } from "express";
import { redeemQRCode } from "../controllers/adminQr.controller.js";
import { authenticateAdmin } from "../middleware/adminAuth.middleware.js";

const router = Router();

router.post(
    "/scan",
    authenticateAdmin,
    redeemQRCode,
);

export default router;