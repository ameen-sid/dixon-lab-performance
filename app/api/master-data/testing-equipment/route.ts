import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		const equipment = await prisma.testingEquipment.findMany({
			orderBy: { slNo: "asc" },
		});
		return NextResponse.json(equipment);
	} catch (error) {
		console.error("Error fetching testing equipment:", error);
		return NextResponse.json({ error: "Failed to fetch testing equipment" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { name, calibrationDueDate, slNo } = body;

		if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

		const newItem = await prisma.testingEquipment.create({
			data: {
				name,
				calibrationDueDate: calibrationDueDate ? new Date(calibrationDueDate) : null,
				slNo: slNo ? parseInt(slNo) : null,
			},
		});

		return NextResponse.json(newItem, { status: 201 });
	} catch (error: any) {
		console.error("Error creating testing equipment:", error);
		if (error.code === "P2002") {
			return NextResponse.json({ error: "Equipment name already exists" }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 });
	}
}
