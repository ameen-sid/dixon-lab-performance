export const runtime = "nodejs";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
        const { id: paramId } = await params;
		const id = parseInt(paramId);
		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
		}

		const body = await req.json();
		const { name, username, password, role } = body;

		// Build data object for update
		const updateData: any = {};
		if (name) updateData.name = name;
		if (username) updateData.username = username;
		if (role) updateData.role = role;

		// If password is provided, hash it
		if (password && password.trim() !== "") {
			const saltRounds = 10;
			updateData.password = await bcrypt.hash(password, saltRounds);
		}

		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
		});

		const { password: _, ...userWithoutPassword } = updatedUser;
		return NextResponse.json(userWithoutPassword, { status: 200 });
	} catch (error: any) {
		console.error("Error updating user:", error);
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "Username already taken. Please choose a different one." },
				{ status: 409 },
			);
		}
		if (error.code === "P2025") {
			return NextResponse.json({ error: "User not found." }, { status: 404 });
		}
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
        const { id: paramId } = await params;
		const id = parseInt(paramId);
		if (isNaN(id)) {
			return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
		}

		await prisma.user.delete({
			where: { id },
		});

		return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
	} catch (error: any) {
		console.error("Error deleting user:", error);
		if (error.code === "P2025") {
			return NextResponse.json({ error: "User not found." }, { status: 404 });
		}
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 },
		);
	}
}
