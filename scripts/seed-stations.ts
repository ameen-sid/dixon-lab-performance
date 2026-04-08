import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	console.log("Seeding stations...");
	
	const stations = [];
	for (let p = 1; p <= 14; p++) {
		for (let s = 1; s <= 10; s++) {
			stations.push({
				id: `P${p}-S${s}`,
				platformId: `P${p}`,
				status: "AVAILABLE",
			});
		}
	}

	for (const station of stations) {
		await prisma.station.upsert({
			where: { id: station.id },
			update: {},
			create: station,
		});
	}

	console.log(`Successfully seeded ${stations.length} stations.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
