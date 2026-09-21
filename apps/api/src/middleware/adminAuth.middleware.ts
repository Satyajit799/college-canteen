import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import type { AuthRequest } from "./auth.middleware.js";

interface AdminTokenPayload {
    adminId: number;
    email: string;
    role: string;
}

export async function authenticateAdmin(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Admin authentication required",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization token",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as AdminTokenPayload;

        const admin = await prisma.admin.findUnique({
            where: {
                id: decoded.adminId,
            },
        });

        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: "Admin account is inactive or does not exist",
            });
        }

        req.adminId = admin.id;

        next();
    } catch (error) {
        console.error("Admin authentication error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired admin token",
        });
    }
}