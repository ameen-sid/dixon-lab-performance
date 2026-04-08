import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		const categories = await prisma.testCategory.findMany({
			orderBy: { slNo: "asc" },
		});
		return NextResponse.json(categories);
	} catch (error) {
		console.error("Error fetching test categories:", error);
		return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, slNo } = body;

		if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

		const newItem = await prisma.testCategory.create({
			data: {
				name,
				slNo: slNo ? parseInt(slNo) : null,
			},
		});

		return NextResponse.json(newItem, { status: 201 });
	} catch (error: any) {
		console.error("Error creating test category:", error);
		if (error.code === "P2002") {
			return NextResponse.json({ error: "Test name already exists" }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to create test category" }, { status: 500 });
	}
}
