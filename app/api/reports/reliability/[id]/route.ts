export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const testId = parseInt(id);

		const test = await prisma.reliabilityTest.findUnique({
			where: { id: testId },
			include: {
				dailyLogs: {
					orderBy: { logDate: "desc" }, // Order logs from newest to oldest
				},
			},
		});

		if (!test) {
			return NextResponse.json(
				{ error: "Reliability Test not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(test, { status: 200 });
	} catch (error) {
		console.error("Error fetching reliability test:", error);
		return NextResponse.json(
			{ error: "Failed to fetch report" },
			{ status: 500 },
		);
	}
}
