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

export async function approveTestPlan(planId: number) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Head") throw new Error("Unauthorized");

	await prisma.testPlan.update({
		where: { id: planId },
		data: { status: "APPROVED" }
	});

	revalidatePath("/dashboard/head/test-reports");
	revalidatePath("/dashboard/requester/requests");
}

export async function rejectTestPlanToRequester(planId: number) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Head") throw new Error("Unauthorized");

	await prisma.testPlan.update({
		where: { id: planId },
		data: { status: "FAILED" }
	});

	revalidatePath("/dashboard/head/failures");
	revalidatePath("/dashboard/requester/requests");
}

export async function returnTestPlanToTesting(planId: number) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Head") throw new Error("Unauthorized");

	await prisma.testPlan.update({
		where: { id: planId },
		data: { 
			status: "PLANNED",
			managerReviewed: false
		}
	});

	revalidatePath("/dashboard/head/failures");
	revalidatePath("/dashboard/manager/plans");
}
