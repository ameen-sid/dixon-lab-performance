import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const { name, partNo } = await req.json();

		const updatedProduct = await prisma.productPart.update({
			where: { id: parseInt(id) },
			data: { 
				name,
				partNo: partNo || null
			},
		});
		return NextResponse.json(updatedProduct);
	} catch (error: any) {
		if (error.code === "P2002") {
			return NextResponse.json({ error: "A product with this name already exists" }, { status: 400 });
		}
		console.error("Error updating product:", error);
		return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
	}
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		await prisma.productPart.delete({
			where: { id: parseInt(id) },
		});
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting product:", error);
		return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
	}
}
