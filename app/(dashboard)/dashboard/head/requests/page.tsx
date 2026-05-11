import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import RequestActionButtons from "@/src/components/head/RequestActionButtons";
import StatusFilter from "@/src/components/head/StatusFilter";
import DateRangeFilter from "@/src/components/head/DateRangeFilter";
import Pagination from "../../../../../src/components/shared/Pagination";
import { Suspense } from "react";
import { startOfDay, endOfDay } from "date-fns";

export default async function HeadRequestsPage(props: { searchParams: any }) {
	const user = await getCurrentUser();

	if (!user || user.role !== "Head") {
		redirect("/login");
	}

	const params = await props.searchParams;
	const status = params.status;
	const fromDate = params.fromDate;
	const toDate = params.toDate;
	const currentPage = parseInt(params.page || "1");
	const itemsPerPage = 10;

	// Build filter
	const where: any = {};
	if (status && status !== "All") {
		where.status = status;
	}
	
	if (fromDate || toDate) {
		const filter: any = {};
		if (fromDate) {
			const d = new Date(fromDate);
			if (!isNaN(d.getTime())) filter.gte = startOfDay(d);
		}
		if (toDate) {
			const d = new Date(toDate);
			if (!isNaN(d.getTime())) filter.lte = endOfDay(d);
		}
		if (Object.keys(filter).length > 0) {
			where.createdAt = filter;
		}
	}

	// Get total count for pagination
	const totalItems = await prisma.testRequest.count({ where });

	// Get paginated requests
	const requests = await prisma.testRequest.findMany({
		where,
		include: {
			requester: true,
		},
		orderBy: { createdAt: "desc" },
		skip: (currentPage - 1) * itemsPerPage,
		take: itemsPerPage,
	});

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						Sample Tests
					</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Review and manage all incoming laboratory test requests.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<Suspense fallback={<div className="h-10 w-48 bg-slate-100 animate-pulse rounded-xl" />}>
						<DateRangeFilter />
					</Suspense>
					<Suspense fallback={<div className="h-10 w-32 bg-slate-100 animate-pulse rounded-xl" />}>
						<StatusFilter />
					</Suspense>
				</div>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-slate-50/50 border-b border-slate-100">
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requester</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample / Part</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{requests.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
										No matching requests found
									</td>
								</tr>
							) : (
								requests.map((request) => (
									<tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-6 py-4">
											<p className="text-sm font-bold text-slate-800">{request.requester.name}</p>
											<p className="text-[10px] text-slate-400 font-medium">{request.department || "N/A"}</p>
										</td>
										<td className="px-6 py-4">
											<p className="text-sm font-bold text-slate-800">{request.samplePartName}</p>
											<p className="text-xs text-slate-400">{request.samplePartNo || "N/A"}</p>
										</td>
										<td className="px-6 py-4 text-sm font-medium text-slate-600">
											{request.modelIdentification || "N/A"}
										</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${request.status === "Pending" ? "bg-amber-100 text-amber-700" :
													request.status === "Approved" ? "bg-blue-100 text-blue-700" :
														request.status === "Rejected" ? "bg-red-100 text-red-700" :
															"bg-emerald-100 text-emerald-700"
												}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${request.status === "Pending" ? "bg-amber-500 animate-pulse" :
														request.status === "Approved" ? "bg-blue-500" :
															request.status === "Rejected" ? "bg-red-500" :
																"bg-emerald-500"
													}`} />
												{request.status}
											</span>
										</td>
										<td className="px-6 py-4 text-xs text-slate-400 font-medium">
											{new Date(request.createdAt).toLocaleDateString("en-IN", {
												day: "2-digit",
												month: "short",
												year: "numeric",
											})}
										</td>
										<td className="px-6 py-4 text-right">
											<RequestActionButtons request={request} />
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
