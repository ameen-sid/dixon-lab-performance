import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const planId = parseInt(id);

		const plan = await prisma.testPlan.findUnique({
			where: { id: planId },
			include: { 
				dailyLogs: true,
				testProtocol: true
			}
		});

		if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

		// 1. Logic: Check for any "NG" (No Good) in the logs across all component fields
		const hasComponentFailure = plan.dailyLogs.some(log => {
			const values = Object.values(log);
			return values.some(v => typeof v === 'string' && v.toUpperCase() === 'NG');
		});

		// 2. Logic: Check if target cycles were reached
		const criteriaText = (plan.testProtocol.judgementCriteria || "") + " " + (plan.testProtocol.name || "");
		const targetCyclesMatch = criteriaText.match(/(\d{2,6})\s*cycles/i);
		const targetCycles = targetCyclesMatch ? parseInt(targetCyclesMatch[1]) : 0;
		
		const maxCyclesReached = plan.dailyLogs.reduce((max, log) => Math.max(max, log.totalCycles || 0), 0);
		const cycleFailure = targetCycles > 0 && maxCyclesReached < targetCycles;

		// Determine Status
		const isPassed = !hasComponentFailure && !cycleFailure;
		const newStatus = isPassed ? "PENDING_REVIEW" : "FAILED";

		// Construct Message
		let message = isPassed 
			? "Test passed evaluation based on criteria. Pending manager review." 
			: "Test failed evaluation.";
		
		if (hasComponentFailure) message += " Reason: Component abnormalities (NG) detected.";
		if (cycleFailure) message += ` Reason: Target cycles not reached (${maxCyclesReached}/${targetCycles}).`;

		const updated = await prisma.testPlan.update({
			where: { id: planId },
			data: { status: newStatus }
		});

		return NextResponse.json({ 
			status: newStatus,
			message: message
		});
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
