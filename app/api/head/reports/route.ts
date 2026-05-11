import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		const reports = await prisma.testPlan.findMany({
			where: {
				managerReviewed: true,
				status: {
					in: ["PENDING_APPROVAL", "COMPLETED", "FAILED"]
				}
			},
			include: {
				testType: true,
				testCategory: true,
				testProtocol: true,
				dailyLogs: true
			}
		});
		return NextResponse.json(reports);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PATCH(req: Request) {
	try {
		const body = await req.json();
		const { id, action, remarks } = body;
		const plan = await prisma.testPlan.findUnique({
			where: { id },
			include: { inspectionResult: true }
		});

		const requestId = plan?.inspectionResult?.testRequestId;

		let updateData: any = { status: "APPROVED" };
		
		if (action === "REJECT_TO_REQUESTER") {
			updateData = { 
				status: "REJECTED",
				remarks: remarks || undefined
			};
			if (requestId) {
				await prisma.testRequest.update({
					where: { id: requestId },
					data: { status: "Rejected" }
				});
			}
		} else if (action === "RETURN_TO_TESTING") {
			updateData = { 
				status: "FAILED", 
				managerReviewed: false,
				retestFlag: true,
				retestCount: { increment: 1 },
				remarks: "Returned for re-testing: " + (remarks || "")
			};
		} else if (action === "APPROVE") {
			updateData = { 
				status: "APPROVED",
				remarks: remarks || undefined
			};
			if (requestId) {
				await prisma.testRequest.update({
					where: { id: requestId },
					data: { status: "Completed" }
				});
			}
		}

		const updated = await prisma.testPlan.update({
			where: { id },
			data: updateData
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
