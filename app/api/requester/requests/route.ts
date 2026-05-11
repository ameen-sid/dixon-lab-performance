import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		const requests = await prisma.testRequest.findMany({
			where: { requesterId: user.userId },
			include: { 
				inspection: {
					include: {
						testPlans: true
					}
				}
			},
			orderBy: { createdAt: "desc" },
		});

		return NextResponse.json(requests);
	} catch (error) {
		console.error("GET_REQUESTS_ERROR", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
