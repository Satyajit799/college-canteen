import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getCourses(
    _req: Request,
    res: Response
) {
    try {
        const courses = await prisma.course.findMany({
            where: {
                students: {
                    some: {
                        isActive: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        res.json({
            success: true,
            data: courses,
        });
    } catch (error) {
        console.error("Failed to fetch courses:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
        });
    }
}

export async function getCourseYears(
    req: Request,
    res: Response
) {
    try {
        const courseId = Number(req.params.courseId);

        if (!Number.isInteger(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const years = await prisma.academicYear.findMany({
            where: {
                students: {
                    some: {
                        courseId,
                        isActive: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return res.json({
            success: true,
            data: years,
        });
    } catch (error) {
        console.error("Failed to fetch course years:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch course years",
        });
    }
}