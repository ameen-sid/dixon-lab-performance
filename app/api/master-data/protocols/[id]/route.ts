export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const protocolId = parseInt(id);
		const body = await req.json();

		const updated = await prisma.testProtocol.update({
			where: { id: protocolId },
			data: {
				testName: body.testName,
				productType: body.productType,
				testPurpose: body.testPurpose,
				testMethod: body.testMethod,
				judgementCriteria: body.judgementCriteria,
				testDuration: body.testDuration,
			},
		});

		return NextResponse.json(updated, { status: 200 });
	} catch (error: any) {
		console.error("Error updating protocol:", error);
		if (error.code === "P2002") {
			return NextResponse.json(
				{ error: "A protocol with this name already exists." },
				{ status: 409 },
			);
		}
		return NextResponse.json(
			{ error: "Failed to update protocol" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const protocolId = parseInt(id);

		await prisma.testProtocol.delete({
			where: { id: protocolId },
		});

		return NextResponse.json({ message: "Protocol deleted" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting protocol:", error);
		return NextResponse.json(
			{ error: "Failed to delete protocol" },
			{ status: 500 },
		);
	}
}
