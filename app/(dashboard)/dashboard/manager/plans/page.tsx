import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { startOfDay, endOfDay } from "date-fns";

import PlansClient from "@/src/components/manager/PlansClient";
import PlanStatusFilter from "@/src/components/manager/PlanStatusFilter";
import DateRangeFilter from "@/src/components/head/DateRangeFilter";

export default async function TestPlanningPage({ searchParams }: { searchParams: Promise<{ filter?: string, fromDate?: string, toDate?: string, page?: string }> }) {
	const user = await getCurrentUser();

	if (!user || user.role !== "Lab Manager") {
		redirect("/login");
	}

	const params = await searchParams;
	const { filter, fromDate, toDate } = params;
	const currentPage = parseInt(params.page || "1");
	const itemsPerPage = 10;

	// Build filter
	const where: any = {};
	
	if (filter) {
		where.status = filter;
	}
	
	if (fromDate || toDate) {
		const filterDate: any = {};
		if (fromDate) {
			const d = new Date(fromDate);
			if (!isNaN(d.getTime())) filterDate.gte = startOfDay(d);
		}
		if (toDate) {
			const d = new Date(toDate);
			if (!isNaN(d.getTime())) filterDate.lte = endOfDay(d);
		}
		if (Object.keys(filterDate).length > 0) {
			where.createdAt = filterDate;
		}
	}

	// Get total count
	const totalItems = await prisma.testPlan.count({ where });

	const plans = await prisma.testPlan.findMany({
		where,
		include: {
			testType: true,
			testCategory: true,
			testProtocol: true,
		},
		orderBy: { createdAt: "desc" },
		skip: (currentPage - 1) * itemsPerPage,
		take: itemsPerPage,
	});

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Planning & Scheduling</h2>
					<p className="text-slate-500 mt-1 font-medium">Lab Manager's calendar and upcoming test queue.</p>
				</div>
				<div className="flex flex-wrap items-center justify-end gap-3 md:ml-auto">
					<Suspense fallback={<div className="h-10 w-48 bg-slate-100 animate-pulse rounded-xl" />}>
						<DateRangeFilter />
					</Suspense>
					<Suspense fallback={<div className="h-10 w-32 bg-slate-100 animate-pulse rounded-xl" />}>
						<PlanStatusFilter />
					</Suspense>
				</div>
			</div>

			<PlansClient 
				initialPlans={JSON.parse(JSON.stringify(plans))} 
				totalItems={totalItems}
				currentPage={currentPage}
				itemsPerPage={itemsPerPage}
			/>
		</div>
	);
}
