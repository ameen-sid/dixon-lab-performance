import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

async function main() {
	// Your exact Hostinger connection string
	const dbUrl =
		"mysql://u939623996_dexon_demo:DexonDemo%23123@auth-db1558.hstgr.io:3306/u939623996_DexonDemo";

	console.log("Connecting to Hostinger database...");
	const connection = await mysql.createConnection(dbUrl);

	console.log("Hashing password...");
	const hashedPassword = await bcrypt.hash("admin123", 10);

	console.log("Inserting admin user...");
	// Inserting directly into the Prisma-generated User table
	await connection.execute(
		"INSERT INTO User (name, username, password, role, updatedAt) VALUES (?, ?, ?, ?, NOW())",
		["System Admin", "admin123", hashedPassword, "ADMIN"],
	);

	console.log("✅ Successfully created admin user!");
	await connection.end();
}

main().catch(console.error);
