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

		const test = await prisma.functionalTest.findUnique({
			where: { id: testId },
			include: {
				images: true, // This automatically fetches the related photos for the report
			},
		});

		if (!test) {
			return NextResponse.json(
				{ error: "Functional Test not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json(test, { status: 200 });
	} catch (error) {
		console.error("Error fetching functional test:", error);
		return NextResponse.json(
			{ error: "Failed to fetch report" },
			{ status: 500 },
		);
	}
}
