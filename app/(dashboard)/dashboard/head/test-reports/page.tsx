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
	const where: any = {
		managerReviewed: true,
	};

	if (filter === "failed") {
		where.status = "FAILED";
	} else {
		// For completed reports, we show those pending approval, completed (from testing), or already approved
		where.status = {
			in: ["PENDING_APPROVAL", "COMPLETED", "APPROVED"]
		};
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
