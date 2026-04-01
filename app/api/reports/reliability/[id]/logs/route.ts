export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const testId = parseInt(id);
		const body = await req.json();

		const newLog = await prisma.dailyLog.create({
			data: {
				reliabilityTestId: testId,
				logDate: new Date(body.logDate),
				noOfWashCycle: body.noOfWashCycle ? parseInt(body.noOfWashCycle) : null,
				noOfSpinCycle: body.noOfSpinCycle ? parseInt(body.noOfSpinCycle) : null,
				sealBellow: body.sealBellow,
				washTimer: body.washTimer,
				gearBox: body.gearBox,
				pulsator: body.pulsator,
				washCurrentCycle: body.washCurrentCycle,
				spinCurrentCycle: body.spinCurrentCycle,
				remarks: body.remarks,
			},
		});

		return NextResponse.json(newLog, { status: 201 });
	} catch (error: any) {
		console.error("Error creating daily log:", error);

		// Handle the @@unique constraint if they submit twice on the same day
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "A log for this date already exists for this test." },
				{ status: 409 },
			);
		}

		return NextResponse.json(
			{ error: "Failed to save daily log" },
			{ status: 500 },
		);
	}
}
