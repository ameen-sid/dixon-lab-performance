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
						endDate: true,
					}
				}
			}
		});

		const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

		// 2. Fetch active test plans (Only PLANNED and ONGOING occupy stations)
		const activePlans = await prisma.testPlan.findMany({
			where: {
				status: { in: ["PLANNED", "ONGOING"] },
				startDate: { lte: endOfToday },
				endDate: { gte: startOfToday }
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
						endDate: activePlan.endDate,
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
