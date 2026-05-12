import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const equipmentData = `
01	Digital pressure gauge	06 Apr 2026
02	Rain /Shower tester	13 Sep 2026
03	Environment Chamber	13 Sep 2026
04	Anti clamp Tester	13 Sep 2026
05	vertical Compression Tester	13 Sep 2026
06	Zero Drop Tester	13 Sep 2026
07	Inclined Impact tester	13 Sep 2026
08	Bump tester	13 Sep 2026
09	Automatic Transportation tester	13 Sep 2026
10	Virtical/horizontal vibration Tester	13 Sep 2026
11	Salt spray chamber	13 Sep 2026
12	Small Environment Chamber	13 Sep 2026
13	AC Power source	13 Sep 2026
14	Dryer	13 Sep 2026
15	Gyser (100 Ltr.)	13 Sep 2026
16	High Water Pressure System	13 Sep 2026
17	HV-IR Tester	13 Sep 2026
18	DC Power supply	13 Sep 2026
19	Micrometer	13 Sep 2026
20	Vernier Caliper	13 Sep 2026
21	Vernier Caliper (Alt)	13 Sep 2026
22	Digital Thermometer	13 Sep 2026
23	Filler Gauge	13 Sep 2026
24	Pin gauge(0-10 mm)	13 Sep 2026
25	Digital Multimeter	13 Sep 2026
26	Digital Techometer	13 Sep 2026
27	Digital Sound level Meter	13 Sep 2026
28	Analog Volt meter	13 Sep 2026
29	Variable Auto transformer	13 Sep 2026
30	Frequency meter	13 Sep 2026
31	Steel Scale	13 Sep 2026
32	Steel Scale (Alt)	13 Sep 2026
33	Torque Wrench	13 Sep 2026
34	Torque Wrench (Alt 1)	13 Sep 2026
35	Torque Wrench (Alt 2)	13 Sep 2026
36	Vibration meter	13 Sep 2026
37	Moisture Meter	13 Sep 2026
38	Hardness Tester	13 Sep 2026
39	Digital Push Pull Gauge	13 Sep 2026
40	Weigh M/c.	13 Sep 2026
41	Power meter	13 Sep 2026
42	Tension Meter	13 Sep 2026
43	Digital Clamp Meter	13 Sep 2026
44	Hygro meter	13 Sep 2026
45	Gyser (50 ltr)	13 Sep 2026
`;

async function main() {
	console.log("Starting equipment seed...");

	const lines = equipmentData.trim().split("\n");

	for (const line of lines) {
		const parts = line.split("\t");
		if (parts.length < 3) continue;

		const slNo = parseInt(parts[0].trim(), 10);
		const name = parts[1].trim();
		const dateStr = parts[2].trim();

		// Parse date like "06 Apr 2026"
		const calibrationDueDate = new Date(dateStr);

		if (isNaN(calibrationDueDate.getTime())) {
			console.error(`Invalid date for ${name}: ${dateStr}`);
			continue;
		}

		await prisma.testingEquipment.upsert({
			where: { name },
			update: {
				slNo,
				calibrationDueDate,
				status: "ACTIVE",
			},
			create: {
				slNo,
				name,
				calibrationDueDate,
				status: "ACTIVE",
			},
		});

		console.log(`Upserted: ${slNo} - ${name}`);
	}

	console.log("Equipment seeding completed successfully!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
