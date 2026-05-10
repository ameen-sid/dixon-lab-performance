export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const itemId = parseInt(id);
		const body = await req.json();

		const updated = await prisma.topEquipment.update({
			where: { id: itemId },
			data: {
				name: body.name,
				status: body.status,
			},
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		console.error("Error updating top equipment:", error);
		if (error.code === "P2002") {
			return NextResponse.json({ error: "Equipment name must be unique" }, { status: 409 });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const itemId = parseInt(id);

		await prisma.topEquipment.delete({
			where: { id: itemId },
		});

		return NextResponse.json({ message: "Equipment deleted" });
	} catch (error) {
		console.error("Error deleting top equipment:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
