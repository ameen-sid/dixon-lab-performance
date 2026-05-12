import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { id: idStr } = await params;
		const id = parseInt(idStr);
		if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

		const report = await prisma.capaReport.findFirst({
			where: {
				id,
				submittedById: user.userId
			},
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

		if (!report) return NextResponse.json({ error: "Not Found" }, { status: 404 });

		return NextResponse.json(report);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
