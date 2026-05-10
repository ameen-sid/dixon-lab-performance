import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		const types = await prisma.testType.findMany({
			orderBy: { name: "asc" },
		});
		return NextResponse.json(types);
	} catch (error) {
		return NextResponse.json({ error: "Failed to fetch test types" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const { name } = await req.json();
		if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

		const type = await prisma.testType.create({
			data: { name },
		});
		return NextResponse.json(type);
	} catch (error: any) {
		if (error.code === "P2002") {
			return NextResponse.json({ error: "Test Type already exists" }, { status: 400 });
		}
		return NextResponse.json({ error: "Failed to create test type" }, { status: 500 });
	}
}
