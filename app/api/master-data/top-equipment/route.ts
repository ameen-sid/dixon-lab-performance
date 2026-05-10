export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		if (!body.name) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		const newItem = await prisma.topEquipment.create({
			data: {
				name: body.name,
				status: body.status || "AVAILABLE",
			},
		});

		return NextResponse.json(newItem, { status: 201 });
	} catch (error: any) {
		console.error("Error creating top equipment:", error);
		if (error.code === "P2002") {
			return NextResponse.json({ error: "Equipment name must be unique" }, { status: 409 });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const items = await prisma.topEquipment.findMany({
			orderBy: { name: "asc" },
		});
		return NextResponse.json(items);
	} catch (error) {
		console.error("Error fetching top equipment:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
