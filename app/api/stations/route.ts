import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		// Using type-casting to bypass stale Prisma Client types until dev server is restarted
		const stations = await (prisma as any).station.findMany({
			orderBy: [
				{ platformId: "asc" },
				{ id: "asc" },
			],
			include: {
				reliabilityTest: {
					select: {
						partName: true,
						nameOfTest: true,
					}
				}
			}
		});
		return NextResponse.json(stations);
	} catch (error: any) {
		console.error("Error fetching stations:", error);
		return NextResponse.json({ 
			error: "Failed to fetch stations", 
			details: error.message,
			stack: error.stack 
		}, { status: 500 });
	}
}
