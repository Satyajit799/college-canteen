import { Router } from "express";

import {
    registerStudent,
    loginStudent,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);

export default router;