import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import EngineerStatusFilter from "@/src/components/engineer/EngineerStatusFilter";
import DateRangeFilter from "@/src/components/head/DateRangeFilter";
import Pagination from "../../../../../src/components/shared/Pagination";
import { Suspense } from "react";
import { startOfDay, endOfDay } from "date-fns";

export default async function ManagerAssignedSamplesPage(props: { searchParams: Promise<{ status?: string, fromDate?: string, toDate?: string, page?: string }> }) {
	const user = await getCurrentUser();

	if (!user || user.role !== "Lab Manager") {
		redirect("/login");
	}

	const params = await props.searchParams;
	const status = params.status;
	const fromDate = params.fromDate;
	const toDate = params.toDate;
	const currentPage = parseInt(params.page || "1");
	const itemsPerPage = 10;

	// Build filter: Show samples assigned to the manager
	const where: any = { assignedToId: user.userId };
	
	if (status === "Inspected") {
		where.inspection = { isNot: null };
	} else if (status === "Awaiting") {
		where.inspection = null;
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
	const totalItems = await prisma.testRequest.count({ where });

	const samples = await prisma.testRequest.findMany({
		where,
		include: {
			requester: true,
			inspection: true,
		},
		orderBy: { createdAt: "desc" },
		skip: (currentPage - 1) * itemsPerPage,
		take: itemsPerPage,
	});

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-6">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						My Assigned Samples
					</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Manage and complete inspections for samples you've assigned to yourself.
					</p>
				</div>
				<div className="flex flex-wrap items-center justify-end gap-3 md:ml-auto">
					<Suspense fallback={<div className="h-10 w-48 bg-slate-100 animate-pulse rounded-xl" />}>
						<DateRangeFilter />
					</Suspense>
					<Suspense fallback={<div className="h-10 w-32 bg-slate-100 animate-pulse rounded-xl" />}>
						<EngineerStatusFilter />
					</Suspense>
				</div>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-slate-50/50 border-b border-slate-100">
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample / Part</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{samples.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
										No samples assigned to yourself yet.
									</td>
								</tr>
							) : (
								samples.map((sample) => (
									<tr key={sample.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-6 py-4">
											<p className="text-sm font-bold text-slate-800">{sample.samplePartName}</p>
											<p className="text-[10px] text-slate-400 font-medium">{sample.samplePartNo || "N/A"}</p>
										</td>
										<td className="px-6 py-4 text-sm font-medium text-slate-600">
											{sample.modelIdentification || "N/A"}
										</td>
										<td className="px-6 py-4 text-sm font-medium text-slate-600">
											{sample.department || "N/A"}
										</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${sample.inspection ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
												}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${sample.inspection ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
												{sample.inspection ? "Inspected" : "Awaiting Inspection"}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											{sample.inspection ? (
												<Link
													href={`/dashboard/engineer/inspect/${sample.id}`}
													className="text-xs font-bold text-slate-400 hover:text-slate-600 underline decoration-slate-200"
												>
													View Report
												</Link>
											) : (
												<Link
													href={`/dashboard/engineer/inspect/${sample.id}`}
													className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
												>
													Inspect Now
												</Link>
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
