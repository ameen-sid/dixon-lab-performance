export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

// Handle inline editing (Upsert by Test ID & Date)
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const testId = parseInt(id);
		const body = await req.json();
		const { logDate, ...data } = body;

		if (!logDate) return NextResponse.json({ error: "Log Date is required" }, { status: 400 });

		const recordDate = new Date(logDate);
		// Normalize to midnight UTC to avoid timezone shifts
		recordDate.setUTCHours(0, 0, 0, 0);

		const updated = await prisma.dailyLog.upsert({
			where: {
				reliabilityTestId_logDate: {
					reliabilityTestId: testId,
					logDate: recordDate,
				},
			},
			update: {
				cycleCount: data.cycleCount !== undefined ? (data.cycleCount ? parseInt(data.cycleCount) : null) : undefined,
				pcb: data.pcb,
				feedValve: data.feedValve,
				washMotor: data.washMotor,
				clutch: data.clutch,
				errorDetail: data.errorDetail,
				otherIssues: data.otherIssues,
				remarks: data.remarks,
			},
			create: {
				reliabilityTestId: testId,
				logDate: recordDate,
				cycleCount: data.cycleCount ? parseInt(data.cycleCount) : null,
				pcb: data.pcb,
				feedValve: data.feedValve,
				washMotor: data.washMotor,
				clutch: data.clutch,
				errorDetail: data.errorDetail,
				otherIssues: data.otherIssues,
				remarks: data.remarks,
			},
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		console.error("Upsert Error:", error);
		return NextResponse.json({ error: "Failed to save log data" }, { status: 500 });
	}
}

// Keep POST for any direct additions if needed, but the Excel sheet uses PATCH/Upsert
export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const testId = parseInt(id);
		const body = await req.json();

		const logDate = new Date(body.logDate);
		logDate.setUTCHours(0, 0, 0, 0);

		const newLog = await prisma.dailyLog.create({
			data: {
				reliabilityTestId: testId,
				logDate: logDate,
				cycleCount: body.cycleCount ? parseInt(body.cycleCount) : null,
				pcb: body.pcb,
				feedValve: body.feedValve,
				washMotor: body.washMotor,
				clutch: body.clutch,
				errorDetail: body.errorDetail,
				otherIssues: body.otherIssues,
				remarks: body.remarks,
			},
		});

		return NextResponse.json(newLog, { status: 201 });
	} catch (error: any) {
		if (error.code === "P2002") {
			return NextResponse.json({ error: "A log for this date already exists." }, { status: 409 });
		}
		return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
	}
}
