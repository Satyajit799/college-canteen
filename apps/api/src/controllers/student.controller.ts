import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getStudents(
    req: Request,
    res: Response
) {
    try {
        const courseId = Number(req.query.courseId);
        const yearId = Number(req.query.yearId);

        if (!Number.isInteger(courseId) || !Number.isInteger(yearId)) {
            return res.status(400).json({
                success: false,
                message: "courseId and yearId are required",
            });
        }

        const students = await prisma.student.findMany({
            where: {
                courseId,
                academicYearId: yearId,
                isActive: true,
            },
            select: {
                id: true,
                registrationNo: true,
                name: true,
                course: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                academicYear: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                registrationNo: "asc",
            },
        });

        return res.json({
            success: true,
            count: students.length,
            data: students,
        });
    } catch (error) {
        console.error("Failed to fetch students:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch students",
        });
    }
}