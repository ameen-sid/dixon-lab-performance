import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

// GET all logs for a test plan
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const planId = parseInt(id);
		const plan = await prisma.testPlan.findUnique({
			where: { id: planId },
			include: {
				testType: true,
				testCategory: true,
				testProtocol: true,
				dailyLogs: {
					orderBy: { date: "asc" }
				}
			}
		});
		return NextResponse.json(plan);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

// PATCH: Inline Upsert
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const planId = parseInt(id);
		const body = await req.json();
		const { date, ...data } = body;

		if (!date) return NextResponse.json({ error: "Date is required" }, { status: 400 });

		const recordDate = new Date(date);
		recordDate.setUTCHours(0, 0, 0, 0);

		const updated = await prisma.dailyChecksheet.upsert({
			where: {
				testPlanId_date: {
					testPlanId: planId,
					date: recordDate
				}
			},
			update: {
				loadCondition: data.loadCondition,
				numCycles: data.numCycles !== undefined ? parseInt(data.numCycles) : undefined,
				numCyclesWash: data.numCyclesWash !== undefined ? parseInt(data.numCyclesWash) : undefined,
				numCyclesSpin: data.numCyclesSpin !== undefined ? parseInt(data.numCyclesSpin) : undefined,
				totalCycles: data.totalCycles !== undefined ? parseInt(data.totalCycles) : undefined,
				motor: data.motor,
				clutch: data.clutch,
				waterInlet: data.waterInlet,
				pressureSensor: data.pressureSensor,
				pcb: data.pcb,
				suspensionRod: data.suspensionRod,
				drainMotor: data.drainMotor,
				lidSwitch: data.lidSwitch,
				inverterBoard: data.inverterBoard,
				washMotor: data.washMotor,
				spinMotor: data.spinMotor,
				gearBox: data.gearBox,
				sealBellow: data.sealBellow,
				washTimer: data.washTimer,
				spinTimer: data.spinTimer,
				drainSelector: data.drainSelector,
				capacitor: data.capacitor,
				safetySwitch: data.safetySwitch,
				remarks: data.remarks,
			},
			create: {
				testPlanId: planId,
				date: recordDate,
				loadCondition: data.loadCondition,
				numCycles: data.numCycles ? parseInt(data.numCycles) : null,
				numCyclesWash: data.numCyclesWash ? parseInt(data.numCyclesWash) : null,
				numCyclesSpin: data.numCyclesSpin ? parseInt(data.numCyclesSpin) : null,
				totalCycles: data.totalCycles ? parseInt(data.totalCycles) : null,
				motor: data.motor,
				clutch: data.clutch,
				waterInlet: data.waterInlet,
				pressureSensor: data.pressureSensor,
				pcb: data.pcb,
				suspensionRod: data.suspensionRod,
				drainMotor: data.drainMotor,
				lidSwitch: data.lidSwitch,
				inverterBoard: data.inverterBoard,
				washMotor: data.washMotor,
				spinMotor: data.spinMotor,
				gearBox: data.gearBox,
				sealBellow: data.sealBellow,
				washTimer: data.washTimer,
				spinTimer: data.spinTimer,
				drainSelector: data.drainSelector,
				capacitor: data.capacitor,
				safetySwitch: data.safetySwitch,
				remarks: data.remarks,
			}
		});

		// Ensure status is ONGOING
		await prisma.testPlan.update({
			where: { id: planId },
			data: { status: "ONGOING" }
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		console.error("Upsert error:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
