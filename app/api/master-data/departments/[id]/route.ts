export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const deptId = parseInt(id);
		const body = await req.json();

		if (!body.name || !body.name.trim()) {
			return NextResponse.json({ error: "Department name is required." }, { status: 400 });
		}

		const updated = await prisma.department.update({
			where: { id: deptId },
			data: {
				name: body.name.trim(),
			},
		});

		return NextResponse.json(updated, { status: 200 });
	} catch (error: any) {
		console.error("Error updating department:", error);
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "A department with this name already exists." },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to update department" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const deptId = parseInt(id);

		// Check if department has users
		const userCount = await prisma.user.count({
			where: { departmentId: deptId },
		});

		if (userCount > 0) {
			return NextResponse.json(
				{ error: "Cannot delete department with assigned users." },
				{ status: 400 },
			);
		}

		await prisma.department.delete({
			where: { id: deptId },
		});

		return NextResponse.json({ message: "Department deleted" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting department:", error);
		return NextResponse.json(
			{ error: "Failed to delete department" },
			{ status: 500 },
		);
	}
}
