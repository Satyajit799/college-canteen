import { Router } from "express";
import { getCourses, getCourseYears } from "../controllers/course.controller.js";

const router = Router();

router.get("/", getCourses);
router.get("/:courseId/years", getCourseYears);

export default router;