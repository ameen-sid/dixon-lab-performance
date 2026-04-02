export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const supplierId = parseInt(id);
		const body = await req.json();

		const updated = await prisma.supplier.update({
			where: { id: supplierId },
			data: {
				name: body.name,
				customer: body.customer, // [cite: added customer field]
			},
		});

		return NextResponse.json(updated, { status: 200 });
	} catch (error: any) {
		console.error("Error updating supplier:", error);
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "A supplier with this name already exists." },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to update supplier" },
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
		const supplierId = parseInt(id);

		await prisma.supplier.delete({
			where: { id: supplierId },
		});

		return NextResponse.json({ message: "Supplier deleted" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting supplier:", error);
		return NextResponse.json(
			{ error: "Failed to delete supplier" },
			{ status: 500 },
		);
	}
}
