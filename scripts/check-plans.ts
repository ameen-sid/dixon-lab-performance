import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const plans = await prisma.testPlan.findMany({
        select: {
            id: true,
            status: true,
            managerReviewed: true,
            headDecision: true,
            retestFlag: true
        }
    });
    console.log(JSON.stringify(plans, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
