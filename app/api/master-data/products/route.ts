import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		const products = await prisma.productPart.findMany({
			orderBy: { name: "asc" },
		});
		return NextResponse.json(products);
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const { name, partNo } = await req.json();
		if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

		const newProduct = await prisma.productPart.create({
			data: { 
				name,
				partNo: partNo || null
			},
		});
		return NextResponse.json(newProduct, { status: 201 });
	} catch (error: any) {
		if (error.code === "P2002") {
			return NextResponse.json({ error: "A product with this name already exists" }, { status: 400 });
		}
		console.error("DEBUG - Prisma Error creating product:", error);
		return NextResponse.json({ 
			error: "Failed to create product",
			details: error.message || "Unknown error"
		}, { status: 500 });
	}
}
