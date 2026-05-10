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
