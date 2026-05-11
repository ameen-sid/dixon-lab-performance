import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "Head") {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const reportId = parseInt(id);

		const report = await prisma.capaReport.findUnique({
			where: { id: reportId },
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
			}
		});

		if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

		const submitter = await prisma.user.findUnique({
			where: { id: report.submittedById },
			select: { name: true, role: true }
		});

		return NextResponse.json({
			...report,
			submittedBy: submitter
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
