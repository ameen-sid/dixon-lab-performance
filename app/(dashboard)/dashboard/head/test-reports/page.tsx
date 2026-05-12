import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import HeadReportsClient from "@/src/components/head/HeadReportsClient";

export default async function HeadTestReports({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
	const user = await getCurrentUser();

	if (!user || user.role !== "Head") {
		redirect("/login");
	}

	const params = await searchParams;
	const filter = params.filter;

	// Build the where clause for the database query
	const where: any = {};
	if (filter === "failed") {
		where.OR = [
			{ status: "FAILED", managerReviewed: true },
			{ status: "REJECTED" },
			{ headDecision: { in: ["REJECTED_TO_REQUESTER", "RETURNED_FOR_TESTING"] } }
		];
	} else {
		where.OR = [
			{ managerReviewed: true, status: { in: ["PENDING_APPROVAL", "COMPLETED", "APPROVED"] } },
			{ headDecision: "APPROVED" }
		];
	}

	// Fetch data directly from the database (Server Component optimization)
	const reports = await prisma.testPlan.findMany({
		where,
		include: {
			testType: true,
			testCategory: true,
			testProtocol: true,
			dailyLogs: true
		},
		orderBy: { createdAt: "desc" },
	});

	// Pass serialized data to the Client Component with a unique key to force re-mount on filter change
	return (
		<HeadReportsClient 
			key={filter || "all"}
			initialReports={JSON.parse(JSON.stringify(reports))} 
			filter={filter || null} 
		/>
	);
}
