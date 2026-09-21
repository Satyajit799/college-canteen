import { Router } from "express";
import { adminLogin } from "../controllers/adminAuth.controller.js";

const router = Router();

router.post("/login", adminLogin);

export default router;