import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "Lab Manager") {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const [testTypes, categories, protocols, stations] = await Promise.all([
			prisma.testType.findMany({ orderBy: { name: "asc" } }),
			prisma.testCategory.findMany({ orderBy: { name: "asc" } }),
			prisma.testProtocol.findMany({ orderBy: { name: "asc" } }),
			prisma.station.findMany({ orderBy: { id: "asc" } }),
		]);

		return NextResponse.json({ testTypes, categories, protocols, stations });
	} catch (error) {
		console.error("GET_METADATA_ERROR", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
