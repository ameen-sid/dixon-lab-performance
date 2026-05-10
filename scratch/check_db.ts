import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const plans = await prisma.testPlan.findMany();
  console.log("Total Plans:", plans.length);
  console.log("Plans IDs:", plans.map(p => p.id));
}

check();
