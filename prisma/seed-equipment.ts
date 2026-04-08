import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const equipmentList = [
  { slNo: 1, name: "Digital pressure gauge", dueDate: "2026-09-13" },
  { slNo: 2, name: "Rain /Shower tester", dueDate: "2026-09-13" },
  { slNo: 3, name: "Environment Chamber", dueDate: "2026-09-13" },
  { slNo: 4, name: "Anti clamp Tester", dueDate: "2026-09-13" },
  { slNo: 5, name: "vertical Compression Tester", dueDate: "2026-09-13" },
  { slNo: 6, name: "Zero Drop Tester", dueDate: "2026-09-13" },
  { slNo: 7, name: "Inclined Impact tester", dueDate: "2026-09-13" },
  { slNo: 8, name: "Bump tester", dueDate: "2026-09-13" },
  { slNo: 9, name: "Automatic Transportation tester", dueDate: "2026-09-13" },
  { slNo: 10, name: "Virtical/horizontal vibration Tester", dueDate: "2026-09-13" },
  { slNo: 11, name: "Salt spray chamber", dueDate: "2026-09-13" },
  { slNo: 12, name: "Small Environment Chamber", dueDate: "2026-09-13" },
  { slNo: 13, name: "AC Power source", dueDate: "2026-09-13" },
  { slNo: 14, name: "Dryer", dueDate: "2026-09-13" },
  { slNo: 15, name: "Gyser (100 Ltr.)", dueDate: "2026-09-13" },
  { slNo: 16, name: "High Water Pressure System", dueDate: "2026-09-13" },
  { slNo: 17, name: "HV-IR Tester", dueDate: "2026-09-13" },
  { slNo: 18, name: "DC Power supply", dueDate: "2026-09-13" },
  { slNo: 19, name: "Micrometer", dueDate: "2026-09-13" },
  { slNo: 20, name: "Vernier Caliper", dueDate: "2026-09-13" },
  { slNo: 21, name: "Vernier Caliper (Alt)", dueDate: "2026-09-13" }, // Unique names required
  { slNo: 22, name: "Digital Thermometer", dueDate: "2026-09-13" },
  { slNo: 23, name: "Filler Gauge", dueDate: "2026-09-13" },
  { slNo: 24, name: "Pin gauge(0-10 mm)", dueDate: "2026-09-13" },
  { slNo: 25, name: "Digital Multimeter", dueDate: "2026-09-13" },
  { slNo: 26, name: "Digital Techometer", dueDate: "2026-09-13" },
  { slNo: 27, name: "Digital Sound level Meter", dueDate: "2026-09-13" },
  { slNo: 28, name: "Analog Volt meter", dueDate: "2026-09-13" },
  { slNo: 29, name: "Variable Auto transformer", dueDate: "2026-09-13" },
  { slNo: 30, name: "Frequency meter", dueDate: "2026-09-13" },
  { slNo: 31, name: "Steel Scale", dueDate: "2026-09-13" },
  { slNo: 32, name: "Steel Scale (Alt)", dueDate: "2026-09-13" },
  { slNo: 33, name: "Torque Wrench", dueDate: "2026-09-13" },
  { slNo: 34, name: "Torque Wrench (Alt 1)", dueDate: "2026-09-13" },
  { slNo: 35, name: "Torque Wrench (Alt 2)", dueDate: "2026-09-13" },
  { slNo: 36, name: "Vibration meter", dueDate: "2026-09-13" },
  { slNo: 37, name: "Moisture Meter", dueDate: "2026-09-13" },
  { slNo: 38, name: "Hardness Tester", dueDate: "2026-09-13" },
  { slNo: 39, name: "Digital Push Pull Gauge", dueDate: "2026-09-13" },
  { slNo: 40, name: "Weigh M/c.", dueDate: "2026-09-13" },
  { slNo: 41, name: "Power meter", dueDate: "2026-09-13" },
  { slNo: 42, name: "Tension Meter", dueDate: "2026-09-13" },
  { slNo: 43, name: "Digital Clamp Meter", dueDate: "2026-09-13" },
  { slNo: 44, name: "Hygro meter", dueDate: "2026-09-13" },
  { slNo: 45, name: "Gyser (50 ltr)", dueDate: "2026-09-13" },
];

async function main() {
  console.log("Seeding testing equipment...");
  for (const item of equipmentList) {
    const [day, month, year] = item.dueDate.split("-").reverse(); // Assuming input is dd-mm-yyyy or similar
    // Actually the user gave 13-09-2026 -> 2026-09-13
    const dateObj = new Date(item.dueDate);

    await prisma.testingEquipment.upsert({
      where: { name: item.name },
      update: { calibrationDueDate: dateObj, slNo: item.slNo },
      create: { 
        name: item.name, 
        calibrationDueDate: dateObj, 
        slNo: item.slNo 
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
