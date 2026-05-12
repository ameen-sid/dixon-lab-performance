import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const updated = await prisma.testPlan.update({
        where: { id: 9 },
        data: {
            headDecision: "RETURNED_FOR_TESTING",
            retestFlag: true,
            status: "FAILED" // Usually it was failed if it was returned
        }
    });
    console.log("Updated Plan 9:", updated);
}

main().catch(console.error).finally(() => prisma.$disconnect());
