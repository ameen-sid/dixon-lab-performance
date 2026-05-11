import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import AssignmentPanel from "@/src/components/manager/AssignmentPanel";
import InspectionStatusFilter from "@/src/components/manager/InspectionStatusFilter";
import DateRangeFilter from "@/src/components/head/DateRangeFilter";
import Pagination from "../../../../../src/components/shared/Pagination";
import { Suspense } from "react";
import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";

import CreateTestPlanButton from "@/src/components/manager/CreateTestPlanButton";

export default async function ManagerRequestsPage({ searchParams }: { searchParams: Promise<{ filter?: string, fromDate?: string, toDate?: string, page?: string }> }) {
	const user = await getCurrentUser();

	if (!user || user.role !== "Lab Manager") {
		redirect("/login");
	}

	const params = await searchParams;
	const { filter, fromDate, toDate } = params;
	const currentPage = parseInt(params.page || "1");
	const itemsPerPage = 10;

	// Build filter
	const where: any = { status: "Approved" };
	
	if (filter === "passed") where.inspection = { isPassed: true };
	if (filter === "failed") where.inspection = { isPassed: false };
	if (filter === "pending") where.inspection = null;
	
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
	const totalItems = await prisma.testRequest.count({ where });

	const requests = await prisma.testRequest.findMany({
		where,
		include: {
			requester: true,
			assignedTo: true,
			inspection: {
				include: {
					testPlans: true
				}
			},
		},
		orderBy: { createdAt: "desc" },
		skip: (currentPage - 1) * itemsPerPage,
		take: itemsPerPage,
	});

	const engineers = await prisma.user.findMany({
		where: {
			role: "Engineer"
		}
	});

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						Approved Sample Requests
					</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Assign engineers for head-approved tests and track sample status.
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-end gap-3 md:ml-auto">
					<Suspense fallback={<div className="h-10 w-48 bg-slate-100 animate-pulse rounded-xl" />}>
						<DateRangeFilter />
					</Suspense>
					<Suspense fallback={<div className="h-10 w-32 bg-slate-100 animate-pulse rounded-xl" />}>
						<InspectionStatusFilter />
					</Suspense>
				</div>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-slate-50/50 border-b border-slate-100">
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample / Part</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requester</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Test Name</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Inspection Result</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{requests.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium italic">
										No matching requests found
									</td>
								</tr>
							) : (
								requests.map((request) => (
									<tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-6 py-4">
											<p className="text-sm font-bold text-slate-800">{request.samplePartName}</p>
											<p className="text-[10px] text-slate-400 font-medium">{request.modelIdentification || "No Model"}</p>
										</td>
										<td className="px-6 py-4">
											<p className="text-sm font-bold text-slate-800">{request.requester.name}</p>
											<p className="text-[10px] text-slate-400 font-medium">{request.department || "N/A"}</p>
										</td>
										<td className="px-6 py-4 text-sm font-medium text-slate-600">
											{request.testName || "N/A"}
										</td>
										<td className="px-6 py-4">
											{request.assignedTo ? (
												<div className="flex items-center gap-2">
													<div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
														{request.assignedTo.name.charAt(0).toUpperCase()}
													</div>
													<p className="text-xs font-bold text-slate-700">{request.assignedTo.name}</p>
												</div>
											) : (
												<span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Unassigned</span>
											)}
										</td>
										<td className="px-6 py-4 text-center">
											{request.inspection ? (
												<span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border ${request.inspection.isPassed
													? "bg-emerald-50 text-emerald-600 border-emerald-100"
													: "bg-red-50 text-red-600 border-red-100"
													}`}>
													{request.inspection.isPassed ? "PASSED" : "FAILED"}
												</span>
											) : (
												<span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 animate-pulse">
													PENDING
												</span>
											)}
										</td>
										<td className="px-6 py-4 text-right">
											{request.inspection ? (
												<div className="flex items-center justify-end gap-2">
													<Link
														href={`/dashboard/engineer/inspect/${request.id}`}
														className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95 whitespace-nowrap"
													>
														View Report
													</Link>
													{request.inspection.isPassed && request.inspection.testPlans?.length === 0 && (
														<CreateTestPlanButton 
															inspectionId={request.inspection.id} 
															requestDetails={{
																name: request.samplePartName,
																model: request.modelIdentification || "N/A"
															}}
														/>
													)}
												</div>
											) : (
												<AssignmentPanel
													request={request}
													engineers={engineers}
													currentUserId={user.userId}
												/>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination Controls */}
				<Suspense fallback={<div className="h-16 bg-slate-50/30 animate-pulse" />}>
					<Pagination 
						totalItems={totalItems} 
						itemsPerPage={itemsPerPage} 
						currentPage={currentPage} 
					/>
				</Suspense>
			</div>
		</div>
	);
}
