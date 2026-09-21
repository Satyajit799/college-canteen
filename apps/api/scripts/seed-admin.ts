import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.resolve(process.cwd(), "../../.env"),
});

const { prisma } = await import("../src/lib/prisma");
import bcrypt from "bcryptjs";

async function seedAdmin() {
    const email = "admin@collegecanteen.com";
    const password = "Admin@123";

    const existingAdmin = await prisma.admin.findUnique({
        where: {
            email,
        },
    });

    if (existingAdmin) {
        console.log("Admin already exists.");
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
        data: {
            name: "Canteen Admin",
            email,
            passwordHash,
            role: "ADMIN",
            isActive: true,
        },
    });

    console.log("Admin created successfully.");
    console.log("Email:", admin.email);
    console.log("Password:", password);
}

seedAdmin()
    .catch((error) => {
        console.error("Failed to create admin:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });