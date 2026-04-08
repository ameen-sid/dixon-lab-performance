export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		const body = await req.json();

		const {
			partName,
			partNo,
			customerSupplier,
			testPurpose,
			sampleQuantity,
			testEquipment,
			startDate,
			endDate,
			reportIssueDate,
			calibrationDueDate,
			ambientTempHumidity,
			testPlace,
			standard,
			testMethod,
			judgementCriteria,
			productType,
			nameOfTest,
			selectedStations, // Array of station IDs
		} = body;

		// Transaction: Create test and update station statuses
		const newReliabilityTest = await prisma.$transaction(async (tx) => {
			const test = await tx.reliabilityTest.create({
				data: {
					partName,
					partNo,
					customerSupplier,
					testPurpose,
					sampleQuantity: sampleQuantity ? parseInt(sampleQuantity) : null,
					testEquipment,
					startDate: new Date(startDate),
					endDate: endDate ? new Date(endDate) : null,
					reportIssueDate: reportIssueDate ? new Date(reportIssueDate) : null,
					calibrationDueDate: calibrationDueDate ? new Date(calibrationDueDate) : null,
					ambientTempHumidity,
					testPlace,
					standard,
					testMethod,
					judgementCriteria,
					productType,
					nameOfTest,
					status: "ONGOING",
				},
			});

			if (selectedStations && selectedStations.length > 0) {
				await tx.station.updateMany({
					where: { id: { in: selectedStations } },
					data: {
						status: "OCCUPIED",
						reliabilityTestId: test.id,
					},
				});
			}

			return test;
		});

		return NextResponse.json(newReliabilityTest, { status: 201 });
	} catch (error: any) {
		console.error("Error starting reliability test:", error);
		return NextResponse.json(
			{ error: "Failed to start test", details: error.message },
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
				stations: {
					select: { id: true, platformId: true }
				}
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
