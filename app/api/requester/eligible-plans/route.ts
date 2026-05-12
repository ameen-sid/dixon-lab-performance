import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		// Fetch test plans that belong to this requester's requests and are FAILED or REJECTED
		const plans = await prisma.testPlan.findMany({
			where: {
				status: { in: ["FAILED", "REJECTED"] },
				inspectionResult: {
					testRequest: {
						requesterId: user.userId
					}
				},
				capaReports: { none: {} }
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
