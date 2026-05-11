import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const reports = await prisma.capaReport.findMany({
			where: {
				submittedById: user.userId
			},
			include: {
				testPlan: {
					include: {
						testProtocol: true,
						testCategory: true
					}
				}
			},
			orderBy: { createdAt: "desc" }
		});

		return NextResponse.json(reports);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const body = await req.json();
		const { testPlanId, problem, rootCause, actionTaken } = body;

		if (!testPlanId || !problem || !rootCause || !actionTaken) {
			return NextResponse.json({ error: "All fields are required" }, { status: 400 });
		}

		const newReport = await prisma.capaReport.create({
			data: {
				testPlanId: parseInt(testPlanId),
				problem,
				rootCause,
				actionTaken,
				submittedById: user.userId,
				status: "Submitted"
			}
		});

		return NextResponse.json(newReport, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
