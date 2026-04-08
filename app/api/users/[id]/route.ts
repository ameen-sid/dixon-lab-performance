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
		const { name, username, password, role, departmentId } = body;

		// Validation: Roles other than SUPER_ADMIN must have a department
		// Only validate if role or departmentId is being changed
		if ((role && role !== "SUPER_ADMIN" && !departmentId) || (departmentId && role !== "SUPER_ADMIN" && !departmentId)) {
			// This is a bit tricky on PATCH since we might not have the other field in the body
			// We might need to fetch the existing user if we want perfect validation on PATCH
			// For now, let's assume the frontend sends what's needed or we validate against the role in body
			if (role && role !== "SUPER_ADMIN" && !departmentId) {
				const existingUser = await prisma.user.findUnique({ where: { id } });
				if (existingUser && !existingUser.departmentId) {
					return NextResponse.json(
						{ error: `Users with the '${role}' role must be assigned to a department.` },
						{ status: 400 },
					);
				}
			}
		}

		// Build data object for update
		const updateData: any = {};
		if (name) updateData.name = name;
		if (username) updateData.username = username;
		if (role) updateData.role = role;
		if (departmentId !== undefined) updateData.departmentId = departmentId ? parseInt(departmentId.toString()) : null;

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
