const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const protocols = await prisma.testProtocol.findMany();
    console.log('Successfully found protocols. Count:', protocols.length);
  } catch (error) {
    console.error('Error from script:', error.message);
    if (error.code) console.error('Error code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

main();
