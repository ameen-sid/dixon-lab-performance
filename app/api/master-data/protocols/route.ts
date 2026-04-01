export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const newProtocol = await prisma.testProtocol.create({
			data: {
				testName: body.testName, // e.g., "Temperature rise test: Wash"
				testCondition: body.testCondition, // e.g., "Keep Voltage 245 V, 50 Hz..."
				testMethod: body.testMethod, // e.g., "Measure the Contact Resistance..."
				judgementCriteria: body.judgementCriteria, // e.g., "Max temp rise allowed 75 Deg C"
			},
		});

		return NextResponse.json(newProtocol, { status: 201 });
	} catch (error: any) {
		console.error("Error creating test protocol:", error);
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "A protocol with this name already exists." },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to create test protocol" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		// Fetch all protocols, ordered alphabetically by name
		const protocols = await prisma.testProtocol.findMany({
			orderBy: { testName: "asc" },
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
