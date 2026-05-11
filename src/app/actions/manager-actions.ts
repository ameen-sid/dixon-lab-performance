"use server";

import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { revalidatePath } from "next/cache";

export async function assignToEngineer(requestId: number, engineerId: number) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Lab Manager") {
		throw new Error("Unauthorized");
	}

	await prisma.testRequest.update({
		where: { id: requestId },
		data: { assignedToId: engineerId },
	});

	revalidatePath("/dashboard/manager/requests");
}

export async function triggerEmail(requestId: number) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Lab Manager") {
		throw new Error("Unauthorized");
	}

	// In a real app, you would use a library like nodemailer or SendGrid here
	console.log(`SIMULATED: Sending notification email for request ID: ${requestId}`);
	
	// Optional: mark as notified in DB
	return { success: true, message: "Notification triggered successfully" };
}
export async function createTestPlan(data: {
	inspectionId: number;
	testTypeId: number;
	testCategoryId: number;
	testProtocolId: number;
	numDays: number;
	startDate: string;
	remarks?: string;
	referenceStd?: string;
	stationIds?: string;
}) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Lab Manager") {
		throw new Error("Unauthorized");
	}

	const start = new Date(data.startDate);
	const end = new Date(start);
	end.setDate(end.getDate() + (data.numDays - 1));

	await prisma.testPlan.create({
		data: {
			inspectionResultId: data.inspectionId,
			testTypeId: data.testTypeId,
			testCategoryId: data.testCategoryId,
			testProtocolId: data.testProtocolId,
			numDays: data.numDays,
			startDate: start,
			endDate: end,
			remarks: data.remarks,
			referenceStd: data.referenceStd,
			stationIds: data.stationIds,
			status: "PLANNED"
		},
	});

	revalidatePath("/dashboard/manager/requests");
}

export async function reviewTestPlan(planId: number) {
	const user = await getCurrentUser();
	if (!user || user.role !== "Lab Manager") throw new Error("Unauthorized");

	const plan = await prisma.testPlan.findUnique({ where: { id: planId } });
	if (!plan) throw new Error("Plan not found");

	const updateData: any = { managerReviewed: true };
	if (plan.status === "PENDING_REVIEW") {
		updateData.status = "PENDING_APPROVAL";
	}

	await prisma.testPlan.update({
		where: { id: planId },
		data: updateData
	});

	revalidatePath("/dashboard/manager/plans");
}
