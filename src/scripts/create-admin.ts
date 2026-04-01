import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const targetUsername = "admin123";
	const plainTextPassword = "admin123";

	console.log(`Checking if user ${targetUsername} exists...`);

	const existingUser = await prisma.user.findUnique({
		where: { username: targetUsername },
	});

	if (existingUser) {
		console.log(`User ${targetUsername} already exists!`);
		return;
	}

	// Hash the password securely
	const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

	// Create the admin user
	const newUser = await prisma.user.create({
		data: {
			name: "System Admin",
			username: targetUsername,
			password: hashedPassword,
			role: "ADMIN",
		},
	});

	console.log(`✅ Successfully created admin user!`);
	console.log(`Username: ${newUser.username}`);
}

main()
	.catch((e) => {
		console.error("❌ Error creating admin:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
