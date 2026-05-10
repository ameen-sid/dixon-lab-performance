import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
	try {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tests = await prisma.testPlan.findMany({
			where: {
				status: { in: ["PLANNED", "ONGOING"] },
				startDate: { lte: new Date() } // On or after scheduled date
			},
			include: {
				testType: true,
				testCategory: true,
				testProtocol: true
			},
			orderBy: { startDate: "asc" }
		});

		return NextResponse.json(tests);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
