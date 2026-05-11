import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const body = await req.json();
		const { status } = body;

		const updated = await prisma.capaReport.update({
			where: { id: parseInt(id) },
			data: { status }
		});

		return NextResponse.json(updated);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
