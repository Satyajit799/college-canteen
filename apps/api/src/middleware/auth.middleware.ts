import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    studentId?: number;
    adminId?: number;
}

export function authenticateStudent(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required",
            });
        }

        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication format",
            });
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error("JWT_SECRET is not configured");
        }

        const decoded = jwt.verify(token, secret) as {
            studentId: number;
            registrationNo: string;
        };

        if (!decoded.studentId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        req.studentId = decoded.studentId;

        next();
    } catch (error) {
        console.error("Authentication failed:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token",
        });
    }
}