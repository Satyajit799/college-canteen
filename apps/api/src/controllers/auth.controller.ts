import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export async function registerStudent(
    req: Request,
    res: Response
) {
    try {
        const {
            registrationNo,
            password,
            confirmPassword,
        } = req.body;

        if (!registrationNo || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Registration number, password and confirm password are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // Find student from college-provided database
        const student = await prisma.student.findUnique({
            where: {
                registrationNo: registrationNo.trim(),
            },
            include: {
                course: true,
                academicYear: true,
            },
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student record not found. Please contact the college administration.",
            });
        }

        if (!student.isActive) {
            return res.status(403).json({
                success: false,
                message: "Student account is inactive",
            });
        }

        // Check whether the student has already registered
        const existingAccount =
            await prisma.studentAccount.findUnique({
                where: {
                    studentId: student.id,
                },
            });

        if (existingAccount) {
            return res.status(409).json({
                success: false,
                message:
                    "Student account already exists. Please login.",
            });
        }

        // Never store the plain password
        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.studentAccount.create({
            data: {
                studentId: student.id,
                passwordHash,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Student registration successful",
            data: {
                studentId: student.id,
                registrationNo: student.registrationNo,
                name: student.name,
                course: student.course,
                academicYear: student.academicYear,
            },
        });
    } catch (error) {
        console.error(
            "Student registration failed:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Student registration failed",
        });
    }
}

export async function loginStudent(
    req: Request,
    res: Response
) {
    try {
        const { registrationNo, password } = req.body;

        if (!registrationNo || !password) {
            return res.status(400).json({
                success: false,
                message: "Registration number and password are required",
            });
        }

        // Find the student from college-provided data
        const student = await prisma.student.findUnique({
            where: {
                registrationNo: registrationNo.trim(),
            },
            include: {
                account: true,
                course: true,
                academicYear: true,
            },
        });

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid registration number or password",
            });
        }

        if (!student.isActive) {
            return res.status(403).json({
                success: false,
                message: "Student account is inactive",
            });
        }

        if (!student.account) {
            return res.status(401).json({
                success: false,
                message: "Student is not registered. Please register first.",
            });
        }

        // Compare entered password with stored hash
        const passwordMatch = await bcrypt.compare(
            password,
            student.account.passwordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid registration number or password",
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is not configured");
        }

        const token = jwt.sign(
            {
                studentId: student.id,
                registrationNo: student.registrationNo,
            },
            secret,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                student: {
                    id: student.id,
                    registrationNo: student.registrationNo,
                    name: student.name,
                    course: student.course,
                    academicYear: student.academicYear,
                },
            },
        });
    } catch (error) {
        console.error("Student login failed:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
}