import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const where = user.role === "Lab Manager" ? {} : { submittedById: user.userId };

		const reports = await prisma.capaReport.findMany({
			where,
			include: { testPlan: { include: { testProtocol: true } } }
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

		const report = await prisma.capaReport.create({
			data: {
				testPlanId: parseInt(testPlanId),
				problem,
				rootCause,
				actionTaken,
				submittedById: user.userId
			}
		});

		return NextResponse.json(report, { status: 201 });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
