export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const newProtocol = await prisma.testProtocol.create({
			data: {
				name: body.name,
				testTypeId: body.testTypeId ? parseInt(body.testTypeId) : null,
				testCategoryId: body.testCategoryId ? parseInt(body.testCategoryId) : null,
				productType: body.productType || "SATL",
				testMethod: body.testMethod,
				judgementCriteria: body.judgementCriteria,
			},
		});

		return NextResponse.json(newProtocol, { status: 201 });
	} catch (error: any) {
		console.error("Error creating test protocol:", error);
		return NextResponse.json(
			{ error: "Failed to create test protocol" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const protocols = await prisma.testProtocol.findMany({
			include: { testType: true, testCategory: true },
			orderBy: { name: "asc" },
		});
		return NextResponse.json(protocols, { status: 200 });
	} catch (error) {
		console.error("Error fetching protocols:", error);
		return NextResponse.json(
			{ error: "Failed to fetch test protocols" },
			{ status: 500 },
		);
	}
}
