import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await req.json();
		const { name, calibrationDueDate, slNo, status } = body;

		const updated = await prisma.testingEquipment.update({
			where: { id: parseInt(id) },
			data: {
				name,
				calibrationDueDate: calibrationDueDate ? new Date(calibrationDueDate) : undefined,
				slNo: slNo ? parseInt(slNo) : undefined,
				status,
			},
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		console.error("Error updating testing equipment:", error);
		if (error.code === "P2002") {
			return NextResponse.json({ error: "Equipment name already exists" }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to update equipment" }, { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		await prisma.testingEquipment.delete({
			where: { id: parseInt(id) },
		});
		return NextResponse.json({ message: "Equipment deleted successfully" });
	} catch (error) {
		console.error("Error deleting testing equipment:", error);
		return NextResponse.json({ error: "Failed to delete equipment" }, { status: 500 });
	}
}
