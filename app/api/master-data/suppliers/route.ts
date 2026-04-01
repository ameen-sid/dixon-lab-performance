export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const newSupplier = await prisma.supplier.create({
			data: {
				name: body.name, // e.g., "Dixon", "IN HOUSE"
			},
		});

		return NextResponse.json(newSupplier, { status: 201 });
	} catch (error: any) {
		console.error("Error creating supplier:", error);
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "This supplier already exists." },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to create supplier" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const suppliers = await prisma.supplier.findMany({
			orderBy: { name: "asc" },
		});
		return NextResponse.json(suppliers, { status: 200 });
	} catch (error) {
		console.error("Error fetching suppliers:", error);
		return NextResponse.json(
			{ error: "Failed to fetch suppliers" },
			{ status: 500 },
		);
	}
}
