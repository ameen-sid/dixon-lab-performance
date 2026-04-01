export const runtime = "nodejs";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, username, password, role } = body;

		if (!username || !password || !name) {
			return NextResponse.json(
				{ error: "Missing required fields: name, username, and password are required." },
				{ status: 400 },
			);
		}

		// 1. Hash the password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// 2. Save the user to the database
		const newUser = await prisma.user.create({
			data: {
				name,
				username,
				password: hashedPassword,
				role: role || "TECHNICIAN",
			},
		});

		// 3. Remove the password from the response for security
		const { password: _, ...userWithoutPassword } = newUser;

		return NextResponse.json(userWithoutPassword, { status: 201 });
	} catch (error: any) {
		console.error("Error creating user:", error);
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "Username already taken. Please choose a different one." },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		// Fetch all users but EXCLUDE their hashed passwords
		const users = await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				username: true,
				role: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(users, { status: 200 });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 },
		);
	}
}
