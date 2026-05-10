export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const newPlan = await prisma.testPlan.create({
			data: {
				testTypeId: parseInt(body.testTypeId),
				testCategoryId: parseInt(body.testCategoryId),
				testProtocolId: parseInt(body.testProtocolId),
				referenceStd: body.referenceStd,
				numDays: parseInt(body.numDays),
				startDate: new Date(body.startDate),
				endDate: new Date(body.endDate),
				remarks: body.remarks,
				stationIds: body.stationIds,
				status: "PLANNED",
			},
		});

		return NextResponse.json(newPlan, { status: 201 });
	} catch (error: any) {
		console.error("Error creating test plan:", error);
		return NextResponse.json({ error: "Failed to create test plan" }, { status: 500 });
	}
}

export async function GET() {
	try {
		const plans = await prisma.testPlan.findMany({
			include: {
				testType: true,
				testCategory: true,
				testProtocol: true,
			},
			orderBy: { startDate: "asc" },
		});
		return NextResponse.json(plans);
	} catch (error) {
		console.error("Error fetching test plans:", error);
		return NextResponse.json({ error: "Failed to fetch test plans" }, { status: 500 });
	}
}
