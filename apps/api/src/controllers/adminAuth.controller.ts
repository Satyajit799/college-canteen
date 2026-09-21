import type { Request, Response } from "express";
import { loginAdmin } from "../services/adminAuth.service.js";

export async function adminLogin(
    req: Request,
    res: Response,
) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const result = await loginAdmin({
            email: email.trim().toLowerCase(),
            password,
        });

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            data: result,
        });
    } catch (error) {
        console.error("Admin login error:", error);

        return res.status(401).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Admin login failed",
        });
    }
}