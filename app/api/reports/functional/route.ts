export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		// In a real app, you should validate 'body' here using a library like Zod.
		const newFunctionalTest = await prisma.functionalTest.create({
			data: {
				productPartName: body.productPartName,
				companySupplier: body.companySupplier,
				customer: body.customer, // [cite: master data enhancement]
				dateOfArrival: new Date(body.dateOfArrival),
				batchSlNo: body.batchSlNo,
				productType: body.productType,
				testName: body.testName,
				model: body.model,
				samples: body.samples,
				instrument: body.instrument,
				testPurpose: body.testPurpose,
				testCondition: body.testCondition,
				testMethod: body.testMethod,
				judgementCriteria: body.judgementCriteria,
				testObservation: body.testObservation,
				isPass: body.isPass,
				testStartDate: new Date(body.testStartDate),
				testEndDate: new Date(body.testEndDate),
				testDuration: body.testDuration,
			},
		});

		return NextResponse.json(newFunctionalTest, { status: 201 });
	} catch (error) {
		console.error("Error creating functional test:", error);
		return NextResponse.json(
			{ error: "Failed to create report" },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const tests = await prisma.functionalTest.findMany({
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json(tests, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch reports" },
			{ status: 500 },
		);
	}
}
