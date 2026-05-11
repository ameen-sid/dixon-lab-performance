import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "Head") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const reports = await prisma.capaReport.findMany({
			include: {
				testPlan: {
					include: {
						testProtocol: true,
						testCategory: true,
						inspectionResult: {
							include: {
								testRequest: true
							}
						}
					}
				}
			},
			orderBy: { createdAt: "desc" }
		});

		// Fetch user details for the submitters
		const userIds = [...new Set(reports.map(r => r.submittedById))];
		const users = await prisma.user.findMany({
			where: { id: { in: userIds } },
			select: { id: true, name: true, role: true }
		});

		const reportsWithUsers = reports.map(r => ({
			...r,
			submittedBy: users.find(u => u.id === r.submittedById)
		}));

		return NextResponse.json(reportsWithUsers);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
