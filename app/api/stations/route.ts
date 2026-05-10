import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		const today = new Date();
		
		// 1. Fetch all stations
		const stations = await (prisma as any).station.findMany({
			include: {
				reliabilityTest: {
					select: {
						partName: true,
						nameOfTest: true,
					}
				}
			}
		});

		// 2. Fetch active test plans
		const activePlans = await prisma.testPlan.findMany({
			where: {
				status: "PLANNED",
				startDate: { lte: today },
				endDate: { gte: today }
			},
			include: {
				testType: true,
				testCategory: true,
				testProtocol: true
			}
		});

		// 3. Merge plan data into stations
		const enrichedStations = stations.map((s: any) => {
			const activePlan = activePlans.find(p => p.stationIds?.split(",").includes(s.id));
			
			if (activePlan) {
				return {
					...s,
					status: "OCCUPIED",
					reliabilityTest: s.reliabilityTest || {
						partName: "Planned: " + activePlan.testProtocol.name,
						nameOfTest: activePlan.testCategory.name,
						isPlanned: true
					}
				};
			}
			return s;
		});

		return NextResponse.json(enrichedStations);
	} catch (error: any) {
		console.error("Error fetching enriched stations:", error);
		return NextResponse.json({ 
			error: "Failed to fetch stations", 
			details: error.message 
		}, { status: 500 });
	}
}
