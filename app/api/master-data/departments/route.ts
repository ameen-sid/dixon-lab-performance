export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		const departments = await prisma.department.findMany({
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(departments, { status: 200 });
	} catch (error) {
		console.error("Error fetching departments:", error);
		return NextResponse.json(
			{ error: "Failed to fetch departments" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	try {
		const body = await req.json();
		if (!body.name || !body.name.trim()) {
			return NextResponse.json({ error: "Department name is required." }, { status: 400 });
		}

		const newDept = await prisma.department.create({
			data: {
				name: body.name.trim(),
			},
		});

		return NextResponse.json(newDept, { status: 201 });
	} catch (error: any) {
		console.error("Error creating department:", error);
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "A department with this name already exists." },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to create department" },
			{ status: 500 },
		);
	}
}
