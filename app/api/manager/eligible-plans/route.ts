import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "Lab Manager") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Managers can only see failed/rejected plans that are flagged for retest 
		// and don't already have an RCA submitted.
		const plans = await prisma.testPlan.findMany({
			where: {
				status: { in: ["FAILED", "REJECTED"] },
				retestFlag: true,
				capaReports: {
					none: {} // No existing CAPA reports
				}
			},
			include: {
				testProtocol: true,
				testCategory: true,
				inspectionResult: {
					include: {
						testRequest: true
					}
				}
			}
		});

		return NextResponse.json(plans);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
