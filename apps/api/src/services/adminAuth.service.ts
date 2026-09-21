import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

interface AdminLoginInput {
    email: string;
    password: string;
}

export async function loginAdmin({
    email,
    password,
}: AdminLoginInput) {
    const admin = await prisma.admin.findUnique({
        where: {
            email,
        },
    });

    if (!admin) {
        throw new Error("Invalid email or password");
    }

    if (!admin.isActive) {
        throw new Error("Admin account is inactive");
    }

    const passwordValid = await bcrypt.compare(
        password,
        admin.passwordHash,
    );

    if (!passwordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            adminId: admin.id,
            email: admin.email,
            role: admin.role,
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: "7d",
        },
    );

    return {
        token,
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    };
}