import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const body = await req.json();
		const { name, slNo } = body;

		const updated = await prisma.testCategory.update({
			where: { id: parseInt(id) },
			data: {
				name,
				slNo: slNo ? parseInt(slNo) : undefined,
			},
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		console.error("Error updating test category:", error);
		if (error.code === "P2002") {
			return NextResponse.json({ error: "Test name already exists" }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		await prisma.testCategory.delete({
			where: { id: parseInt(id) },
		});
		return NextResponse.json({ message: "Category deleted successfully" });
	} catch (error) {
		console.error("Error deleting test category:", error);
		return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
	}
}
