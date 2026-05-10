export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const planId = parseInt(id);
		const body = await req.json();

		const updated = await prisma.testPlan.update({
			where: { id: planId },
			data: {
				testTypeId: parseInt(body.testTypeId),
				testCategoryId: parseInt(body.testCategoryId),
				testProtocolId: parseInt(body.testProtocolId),
				referenceStd: body.referenceStd,
				numDays: parseInt(body.numDays),
				startDate: new Date(body.startDate),
				endDate: new Date(body.endDate),
				remarks: body.remarks,
				stationIds: body.stationIds,
				status: body.status,
			},
		});

		return NextResponse.json(updated);
	} catch (error) {
		console.error("Error updating test plan:", error);
		return NextResponse.json({ error: "Failed to update test plan" }, { status: 500 });
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const planId = parseInt(id);

		await prisma.testPlan.delete({
			where: { id: planId },
		});

		return NextResponse.json({ message: "Test plan deleted" });
	} catch (error) {
		console.error("Error deleting test plan:", error);
		return NextResponse.json({ error: "Failed to delete test plan" }, { status: 500 });
	}
}
