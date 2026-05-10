"use server";

import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveRequest(requestId: number) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Head") {
		throw new Error("Unauthorized");
	}

	await prisma.testRequest.update({
		where: { id: requestId },
		data: { status: "Approved", remarks: "Approved by Head" },
	});

	revalidatePath("/dashboard/head/requests");
	revalidatePath("/dashboard/requester/requests");
}

export async function rejectRequest(requestId: number, remarks: string) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Head") {
		throw new Error("Unauthorized");
	}

	await prisma.testRequest.update({
		where: { id: requestId },
		data: { status: "Rejected", remarks: remarks },
	});

	revalidatePath("/dashboard/head/requests");
	revalidatePath("/dashboard/requester/requests");
}
