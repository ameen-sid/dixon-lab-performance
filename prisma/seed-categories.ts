import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slNo: 1, name: "Energy consumption (BEE)" },
  { slNo: 2, name: "Environment test" },
  { slNo: 3, name: "Freezing test" },
  { slNo: 4, name: "Sharp edge test" },
  { slNo: 5, name: "Basic safety test" },
  { slNo: 6, name: "Brake lifetime test" },
  { slNo: 7, name: "Cold drop" },
  { slNo: 8, name: "Fabric damages (Snages)" },
  { slNo: 9, name: "Door operation distance" },
  { slNo: 10, name: "Transportation cycle test" },
  { slNo: 11, name: "Stacking stability" },
  { slNo: 12, name: "Special handling" },
  { slNo: 13, name: "Marginal drop" },
  { slNo: 14, name: "Door open close test" },
  { slNo: 15, name: "Door strength" },
  { slNo: 16, name: "Hose watering" },
  { slNo: 17, name: "Sharp Edge" },
  { slNo: 18, name: "Standard test" },
  { slNo: 19, name: "Separation test" },
  { slNo: 20, name: "Tensile strength of power cord" },
  { slNo: 21, name: "Protection of external water overflow" },
  { slNo: 22, name: "Durability after 3650 cycles" },
  { slNo: 23, name: "Noise test" },
  { slNo: 24, name: "Transportation cycle test (Repeat)" }, // Handling duplicate
  { slNo: 25, name: "Water overflow and outflow test" },
  { slNo: 26, name: "Tracking proof test" },
  { slNo: 27, name: "Clogged drainage test" },
  { slNo: 28, name: "Damp heat endurance test" },
  { slNo: 29, name: "Leakage test" },
  { slNo: 30, name: "Knob strength test" },
  { slNo: 31, name: "Protection of internal water overflow" },
  { slNo: 32, name: "Operation under various temperature" },
];

async function main() {
  console.log("Seeding test categories...");
  for (const cat of categories) {
    await prisma.testCategory.upsert({
      where: { name: cat.name },
      update: { slNo: cat.slNo },
      create: { 
        name: cat.name, 
        slNo: cat.slNo 
      },
    });
  }
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
