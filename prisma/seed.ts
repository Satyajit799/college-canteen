import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../apps/api/src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in .env");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Starting database seed...");

    const mca = await prisma.course.upsert({
        where: {
            name: "MCA",
        },
        update: {},
        create: {
            name: "MCA",
            code: "MCA",
        },
    });

    const secondYear = await prisma.academicYear.upsert({
        where: {
            name: "2nd Year",
        },
        update: {},
        create: {
            name: "2nd Year",
        },
    });

    await prisma.student.upsert({
        where: {
            registrationNo: "2505107096",
        },
        update: {
            courseId: mca.id,
            academicYearId: secondYear.id,
        },
        create: {
            registrationNo: "2505107096",
            courseId: mca.id,
            academicYearId: secondYear.id,
        },
    });

    await prisma.student.upsert({
        where: {
            registrationNo: "2505107056",
        },
        update: {
            courseId: mca.id,
            academicYearId: secondYear.id,
        },
        create: {
            registrationNo: "2505107056",
            courseId: mca.id,
            academicYearId: secondYear.id,
        },
    });

    console.log("✅ MCA created");
    console.log("✅ 2nd Year created");
    console.log("✅ 2505107096 created");
    console.log("✅ 2505107056 created");
    console.log("🎉 Seed completed successfully!");
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });