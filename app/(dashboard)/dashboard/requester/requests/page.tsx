"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function MyRequestsPage() {
	const [requests, setRequests] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("All");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	const fetchData = async () => {
		try {
			const res = await fetch("/api/requester/requests");
			if (res.ok) {
				const data = await res.json();
				setRequests(data);
			}
		} catch (error) {
			console.error("Failed to fetch requests:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const filtered = useMemo(() => {
		let result = requests;

		// Status Filter
		if (statusFilter !== "All") {
			result = result.filter(r => r.status === statusFilter);
		}

		// Date Range Filter
		if (fromDate || toDate) {
			result = result.filter(r => {
				const date = new Date(r.createdAt);
				const start = fromDate ? startOfDay(new Date(fromDate)) : new Date(0);
				const end = toDate ? endOfDay(new Date(toDate)) : new Date(8640000000000000);
				return isWithinInterval(date, { start, end });
			});
		}

		return result;
	}, [requests, statusFilter, fromDate, toDate]);

	const totalPages = Math.ceil(filtered.length / itemsPerPage);
	const paginated = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filtered.slice(start, start + itemsPerPage);
	}, [filtered, currentPage]);

	useEffect(() => { setCurrentPage(1); }, [statusFilter, fromDate, toDate]);

	const statuses = ["All", "Pending", "Approved", "Rejected"];

	if (loading) return (
		<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
			<div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
			<p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Requests...</p>
		</div>
	);

	return (
		<div className="max-w-full mx-auto pb-12 animate-in fade-in duration-500 ease-out px-4">
			<div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
				<div>
					<h2 className="text-3xl font-black text-slate-900 tracking-tight">My Test Requests</h2>
					<p className="text-slate-500 font-bold mt-2">Track and manage your submitted laboratory requests.</p>
				</div>
				<Link
					href="/dashboard/requester/new"
					className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2 transform hover:-translate-y-1 active:scale-95"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
					</svg>
					New Request
				</Link>
			</div>

			{/* Filters Hub */}
			<div className="flex flex-wrap items-center gap-4 mb-8">
				{/* Status Filter Tabs */}
				<div className="flex gap-2 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
					{statuses.map(s => (
						<button
							key={s}
							onClick={() => setStatusFilter(s)}
							className={`px-6 py-2.5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
								? "bg-slate-900 text-white shadow-lg"
								: "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
								}`}
						>
							{s}
						</button>
					))}
				</div>

				{/* Date Range Filter */}
				<div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm ml-auto">
					<div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl">
						<span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</span>
						<input
							type="date"
							value={fromDate}
							onChange={(e) => setFromDate(e.target.value)}
							className="bg-transparent text-[10px] font-black text-slate-900 outline-none"
						/>
					</div>
					<div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl">
						<span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</span>
						<input
							type="date"
							value={toDate}
							onChange={(e) => setToDate(e.target.value)}
							className="bg-transparent text-[10px] font-black text-slate-900 outline-none"
						/>
					</div>
					{(fromDate || toDate) && (
						<button
							onClick={() => { setFromDate(""); setToDate(""); }}
							className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
							title="Clear Dates"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					)}
				</div>
			</div>

			<div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse min-w-[1000px]">
						<thead>
							<tr className="bg-slate-50/50 border-b border-slate-100">
								<th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[20%]">Sample / Part</th>
								<th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%]">Model</th>
								<th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%]">Test Name</th>
								<th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%] text-center">Quantity</th>
								<th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%]">Status</th>
								<th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[15%]">Feedback/Remarks</th>
								<th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%] text-right">Date</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{paginated.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-8 py-24 text-center">
										<p className="text-sm font-black text-slate-300 uppercase tracking-widest">No matching requests found</p>
									</td>
								</tr>
							) : (
								paginated.map((r) => (
									<tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-8 py-6">
											<p className="text-sm font-black text-slate-800">{r.samplePartName}</p>
											<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{r.samplePartNo || "—"}</p>
										</td>
										<td className="px-6 py-6">
											<p className="text-sm font-bold text-slate-600">{r.modelIdentification || "—"}</p>
										</td>
										<td className="px-6 py-6">
											<p className="text-sm font-bold text-slate-600">{r.testName || "—"}</p>
										</td>
										<td className="px-6 py-6 text-center">
											<span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{r.sampleQuantity}</span>
										</td>
										<td className="px-6 py-6">
											<div className="flex flex-col gap-2">
												<span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${r.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
													r.status === "Approved" ? "bg-blue-50 text-blue-600 border-blue-100" :
														r.status === "Rejected" ? "bg-red-50 text-red-600 border-red-100" :
															"bg-emerald-50 text-emerald-600 border-emerald-100"
													}`}>
													<span className={`w-1.5 h-1.5 rounded-full ${r.status === "Pending" ? "bg-amber-500 animate-pulse" :
														r.status === "Approved" ? "bg-blue-500" :
															r.status === "Rejected" ? "bg-red-500" :
																"bg-emerald-500"
														}`} />
													{r.status}
												</span>
												{r.inspection && (
													<span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${r.inspection.isPassed
														? "bg-emerald-50 text-emerald-600 border-emerald-100"
														: "bg-rose-50 text-rose-600 border-rose-100"
														}`}>
														{r.inspection.isPassed ? "Insp: PASSED" : "Insp: FAILED"}
													</span>
												)}
												{r.inspection?.testPlans?.map((plan: any) => (
													<span key={plan.id} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${(plan.status === "APPROVED")
														? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-200"
														: (plan.status === "FAILED" || plan.status === "REJECTED")
															? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-200"
															: "bg-slate-50 text-slate-400 border-slate-100"
														}`}>
														{plan.status === "APPROVED" ? "PLAN PASSED" : (plan.status === "FAILED" || plan.status === "REJECTED") ? "PLAN FAILED" : `PLAN ${plan.status}`}
													</span>
												))}
											</div>
										</td>
										<td className="px-6 py-6">
											<p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] line-clamp-2 group-hover:line-clamp-none transition-all">
												{r.remarks || "—"}
											</p>
										</td>
										<td className="px-8 py-6 text-right">
											<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
												{format(new Date(r.createdAt), "dd MMM yyyy")}
											</p>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination Controls */}
				{totalPages > 1 && (
					<div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
							Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
						</p>
						<div className="flex items-center gap-2">
							<button
								disabled={currentPage === 1}
								onClick={() => setCurrentPage(p => p - 1)}
								className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
							</button>

							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
									<button
										key={page}
										onClick={() => setCurrentPage(page)}
										className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all border shadow-sm active:scale-95 ${currentPage === page
												? "bg-slate-900 border-slate-900 text-white shadow-slate-900/20"
												: "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
											}`}
									>
										{page.toString().padStart(2, '0')}
									</button>
								))}
							</div>

							<button
								disabled={currentPage === totalPages}
								onClick={() => setCurrentPage(p => p + 1)}
								className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
