export const runtime = "nodejs";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { username, password } = body;

		if (!username || !password) {
			return NextResponse.json(
				{ error: "Username and password are required" },
				{ status: 400 },
			);
		}

		// 1. Find the user by username
		const user = await prisma.user.findUnique({
			where: { username },
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		// 2. Verify the password
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 },
			);
		}

		// 3. Create the JWT Payload
		const secret =
			process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";
		const token = jwt.sign(
			{
				userId: user.id,
				username: user.username,
				role: user.role,
			},
			secret,
			{ expiresIn: "1d" },
		);

		const response = NextResponse.json(
			{
				message: "Login successful",
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
					role: user.role,
				},
			},
			{ status: 200 },
		);

		response.cookies.set({
			name: "auth_token",
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24, // 1 day
		});

		return response;
	} catch (error) {
		console.error("Login error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
