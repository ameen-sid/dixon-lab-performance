import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	console.log("Starting seed...");

	// 1. Seed Departments
	console.log("Seeding departments...");
	const depts = ["R&D", "Quality", "Production", "IT"];
	for (const name of depts) {
		await prisma.department.upsert({
			where: { name },
			update: {},
			create: { name },
		});
	}

	// 2. Seed Users with various roles
	console.log("Seeding users...");
	const hashedPassword = await bcrypt.hash("admin123", 10);
	
	const users = [
		{ name: "System Admin", username: "admin", role: "Admin" },
		{ name: "Lab Manager User", username: "manager", role: "Lab Manager" },
		{ name: "Engineer User", username: "engineer", role: "Engineer" },
		{ name: "Inspector User", username: "inspector", role: "Inspector" },
		{ name: "Head User", username: "head", role: "Head" },
		{ name: "Requester User", username: "requester", role: "Requester" },
	];

	for (const u of users) {
		await prisma.user.upsert({
			where: { username: u.username },
			update: { role: u.role },
			create: {
				name: u.name,
				username: u.username,
				password: hashedPassword,
				role: u.role,
			},
		});
	}

	// 3. Seed Stations
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

	console.log("Seeding completed successfully!");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
