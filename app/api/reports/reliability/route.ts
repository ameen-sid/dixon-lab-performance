export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const newReliabilityTest = await prisma.reliabilityTest.create({
			data: {
				modelCap: body.modelCap,
				partName: body.partName,
				vendor: body.vendor,
				clothLoad: body.clothLoad,
				startDate: new Date(body.startDate),
				status: "ONGOING",
			},
		});

		return NextResponse.json(newReliabilityTest, { status: 201 });
	} catch (error) {
		console.error("Error starting reliability test:", error);
		return NextResponse.json(
			{ error: "Failed to start test" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const tests = await prisma.reliabilityTest.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				dailyLogs: {
					select: { id: true },
				},
			},
		});
		return NextResponse.json(tests, { status: 200 });
	} catch (error) {
		console.error("Error fetching reliability tests:", error);
		return NextResponse.json(
			{ error: "Failed to fetch tests" },
			{ status: 500 },
		);
	}
}
