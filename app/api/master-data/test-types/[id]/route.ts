import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const { name } = await req.json();
		const type = await prisma.testType.update({
			where: { id: parseInt(id) },
			data: { name },
		});
		return NextResponse.json(type);
	} catch (error: any) {
		return NextResponse.json({ error: "Failed to update test type" }, { status: 500 });
	}
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		await prisma.testType.delete({
			where: { id: parseInt(id) },
		});
		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: "Failed to delete test type" }, { status: 500 });
	}
}
