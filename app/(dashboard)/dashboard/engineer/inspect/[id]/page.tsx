import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

import InspectionForm from "@/src/components/engineer/InspectionForm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export default async function InspectionPage({ params }: { params: Promise<{ id: string }> }) {
	const user = await getCurrentUser();
	const { id } = await params;
	const requestId = parseInt(id);

	if (!user || user.role !== "Engineer") {
		redirect("/login");
	}

	const request = await prisma.testRequest.findUnique({
		where: { id: requestId },
		include: { inspection: true },
	});

	if (!request) redirect("/dashboard/engineer/samples");

	async function submitInspection(formData: FormData) {
		"use server";
		
		const p1 = formData.get("point1") as string;
		const p2 = formData.get("point2") as string;
		const p3 = formData.get("point3") as string;
		const p4 = formData.get("point4") as string;
		const p5 = formData.get("point5") as string;
		const p6 = formData.get("point6") as string;
		const p7 = formData.get("point7") as string;
		const p8 = formData.get("point8") as string;
		const p9 = formData.get("point9") as string;

		// Handle File Upload
		const file = formData.get("samplePic") as File;
		let imageUrl = request?.inspection?.imageUrl || "";

		if (file && file.size > 0) {
			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);
			
			const uploadDir = path.join(process.cwd(), "public", "uploads");
			// Ensure directory exists
			await mkdir(uploadDir, { recursive: true });
			
			const fileName = `inspection_${requestId}_${Date.now()}${path.extname(file.name) || ".jpg"}`;
			const filePath = path.join(uploadDir, fileName);
			
			await writeFile(filePath, buffer);
			imageUrl = `/uploads/${fileName}`;
		}

		// Automatic Evaluation: If any point is "No", it's a fail.
		const isPassed = [p1, p2, p3, p4, p5, p6, p7, p8, p9].every(val => val !== "No");

		const data = {
			testRequestId: requestId,
			descriptionMatch: p1,
			modelMatch: p2,
			serialMatch: p3,
			labelAvailable: p4,
			ratingMatch: p5,
			brandMatch: p6,
			manualProvided: p7,
			damageSign: p8,
			accessoriesReceived: p9,
			allottedId: formData.get("point10") as string,
			remarks: formData.get("point11") as string,
			imageUrl: imageUrl, 
			isPassed: isPassed,
			inspectedById: user!.userId,
			inspectedBy: user!.username,
		};

		await prisma.inspectionResult.upsert({
			where: { testRequestId: requestId },
			create: data,
			update: data,
		});

		revalidatePath(`/dashboard/engineer/inspect/${requestId}`);
		redirect("/dashboard/engineer/samples");
	}

	return (
		<InspectionForm 
			request={request} 
			user={user} 
			onSubmit={submitInspection} 
		/>
	);
}
