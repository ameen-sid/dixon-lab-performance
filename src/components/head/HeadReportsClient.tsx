"use client";

import { useState, useMemo } from "react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function HeadReportsClient({ initialReports, filter }: { initialReports: any[], filter: string | null }) {
	const [reports, setReports] = useState(initialReports);
	const [decisionTarget, setDecisionTarget] = useState<{ id: number, action: string, title: string } | null>(null);
	const [remarks, setRemarks] = useState("");
	const [submitting, setSubmitting] = useState(false);

	// Date Range Filters
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");

	const filteredReports = useMemo(() => {
		if (!fromDate && !toDate) return reports;

		return reports.filter(report => {
			const reportDate = new Date(report.startDate);
			const start = fromDate ? startOfDay(new Date(fromDate)) : new Date(0);
			const end = toDate ? endOfDay(new Date(toDate)) : new Date(8640000000000000);

			return isWithinInterval(reportDate, { start, end });
		});
	}, [reports, fromDate, toDate]);

	const { pendingReports, finalizedReports } = useMemo(() => {
		// Pending are those that are FAILED and haven't had a head decision yet
		const pending = filteredReports.filter(r => r.status === "FAILED" && !r.headDecision);
		// Finalized are those with a head decision OR those that are already REJECTED/APPROVED (for legacy data)
		const finalized = filteredReports.filter(r => r.headDecision || r.status === "REJECTED" || r.status === "APPROVED");
		return { pendingReports: pending, finalizedReports: finalized };
	}, [filteredReports]);

	const handleActionInitiate = (id: number, action: string) => {
		let title = "Approve Test Result";
		if (action === "RETURN_TO_TESTING") title = "Return to Testing";
		if (action === "REJECT_TO_REQUESTER") title = "Reject to Requester";

		setDecisionTarget({ id, action, title });
		setRemarks("");
	};

	const submitDecision = async () => {
		if (!decisionTarget) return;
		setSubmitting(true);
		try {
			const res = await fetch("/api/head/reports", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: decisionTarget.id,
					action: decisionTarget.action,
					remarks
				})
			});
			if (res.ok) {
				const updated = await res.json();
				setReports(prev => prev.map(r => r.id === decisionTarget.id ? { ...r, status: updated.status, headDecision: updated.headDecision } : r));
				setDecisionTarget(null);
			}
		} catch { /* fail */ }
		finally { setSubmitting(false); }
	};

	return (
		<div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header & Filters Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
				<div>
					<h2 className="text-3xl font-black text-slate-900 tracking-tight">
						{filter === "failed" ? "Failure Decisions" : "Test Reports Approval"}
					</h2>
					<p className="text-slate-500 font-bold mt-2">
						{filter === "failed" ? "Decide how to proceed with failed components." : "Review results and decide on pass/fail status."}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
					<div className="flex flex-col gap-1">
						<label className="text-[9px] font-black text-slate-400 uppercase ml-2">From Date</label>
						<input
							type="date"
							value={fromDate}
							onChange={(e) => setFromDate(e.target.value)}
							className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-[9px] font-black text-slate-400 uppercase ml-2">To Date</label>
						<input
							type="date"
							value={toDate}
							onChange={(e) => setToDate(e.target.value)}
							className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
						/>
					</div>
					<button
						onClick={() => { setFromDate(""); setToDate(""); }}
						className="mt-4 px-4 py-2 text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
					>
						Clear
					</button>
				</div>
			</div>

			{/* Pending Reports Section */}
			<div className="mb-12">
				{pendingReports.length > 0 && (
					<div className="flex items-center gap-4 mb-6">
						<div className="h-px flex-1 bg-slate-100" />
						<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Approvals ({pendingReports.length})</span>
						<div className="h-px flex-1 bg-slate-100" />
					</div>
				)}

				<div className="grid grid-cols-1 gap-6">
					{pendingReports.length === 0 && filter !== "failed" ? (
						<div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center text-slate-400 font-bold">
							{(fromDate || toDate) ? "No pending reports found in this date range." : "No reports pending approval."}
						</div>
					) : (
						pendingReports.map((report) => (
							<div key={report.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow animate-in fade-in duration-300">
								<div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
									<div className="flex-1">
										<div className="flex items-center gap-3">
											<span className="bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full text-white uppercase tracking-widest">
												{report.testProtocol.productType} LIFE TEST
											</span>
											<span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${report.status === "FAILED" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
												}`}>
												{report.status}
											</span>
										</div>
										<h3 className="text-2xl font-black mt-3 text-slate-900">{report.testProtocol.name}</h3>
										<div className="flex gap-4 mt-2">
											<p className="text-slate-400 font-bold text-xs">ID: #{report.id.toString().padStart(4, '0')}</p>
											<p className="text-slate-400 font-bold text-xs uppercase">CATEGORY: {report.testCategory.name}</p>
										</div>
									</div>

									<div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
										<a
											href={`/api/reports/test-plan/${report.id}`}
											target="_blank"
											className="px-6 py-3 rounded-2xl bg-blue-50 text-blue-700 font-black text-[10px] uppercase tracking-widest border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-2 shadow-sm shadow-blue-100 cursor-pointer"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
											</svg>
											Download Report
										</a>

										{filter !== "failed" ? (
											<button
												onClick={() => handleActionInitiate(report.id, "APPROVE")}
												className="px-7 py-3 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 cursor-pointer"
											>
												Approve Result
											</button>
										) : (
											<>
												<button
													onClick={() => handleActionInitiate(report.id, "RETURN_TO_TESTING")}
													className="px-5 py-3 rounded-2xl bg-amber-50 text-amber-700 font-black text-[10px] uppercase tracking-widest border border-amber-200 hover:bg-amber-100 transition-all shadow-sm cursor-pointer"
												>
													Return to Testing
												</button>
												<button
													onClick={() => handleActionInitiate(report.id, "REJECT_TO_REQUESTER")}
													className="px-5 py-3 rounded-2xl bg-rose-50 text-rose-700 font-black text-[10px] uppercase tracking-widest border border-rose-200 hover:bg-rose-100 transition-all shadow-sm cursor-pointer"
												>
													Reject to Requester
												</button>
											</>
										)}
									</div>
								</div>

								<div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/50 p-8 rounded-3xl border border-slate-100/50">
									<div>
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Test Period</p>
										<p className="font-bold text-slate-700">
											{format(new Date(report.startDate), "dd MMM yyyy")} <span className="text-slate-300 mx-1">→</span> {format(new Date(report.endDate), "dd MMM yyyy")}
										</p>
									</div>
									<div>
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Execution Summary</p>
										<p className="font-bold text-slate-700">{report.dailyLogs?.length || 0} Daily Logs Submitted</p>
									</div>
									<div>
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Platform Assignment</p>
										<p className="font-bold text-slate-700">Stations: {report.stationIds || "All Platforms"}</p>
									</div>
									<div>
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Planned Duration</p>
										<p className="font-bold text-slate-700">{report.numDays} Days Total</p>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Finalized Reports Section (List Style) */}
			{finalizedReports.length > 0 && (
				<div className="mt-16 animate-in slide-in-from-bottom-8 duration-700">
					<div className="flex items-center gap-4 mb-8">
						<div className="h-px flex-1 bg-slate-100" />
						<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Finalized Decisions ({finalizedReports.length})</span>
						<div className="h-px flex-1 bg-slate-100" />
					</div>

					<div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
									<th className="px-8 py-5">Test Protocol</th>
									<th className="px-8 py-5">Duration</th>
									<th className="px-8 py-5">Stations</th>
									<th className="px-8 py-5">Decision</th>
									<th className="px-8 py-5 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-50">
								{finalizedReports.map((report) => (
									<tr key={report.id} className="hover:bg-slate-50/30 transition-colors group">
										<td className="px-8 py-5">
											<div>
												<p className="text-sm font-black text-slate-900">{report.testProtocol.name}</p>
												<p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter mt-0.5">{report.testCategory.name}</p>
											</div>
										</td>
										<td className="px-8 py-5">
											<p className="text-xs font-bold text-slate-600">
												{format(new Date(report.startDate), "dd MMM")} - {format(new Date(report.endDate), "dd MMM")}
											</p>
											<p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{report.numDays} Days</p>
										</td>
										<td className="px-8 py-5">
											<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
												{report.stationIds || "All"}
											</span>
										</td>
										<td className="px-8 py-5">
											<span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap ${
												(report.headDecision === "APPROVED" || report.status === "APPROVED") ? "bg-emerald-100 text-emerald-700" :
												(report.headDecision === "REJECTED_TO_REQUESTER" || report.status === "REJECTED") ? "bg-rose-100 text-rose-700" :
												(report.headDecision === "RETURNED_FOR_TESTING" || report.retestFlag) ? "bg-amber-100 text-amber-700" :
												"bg-slate-100 text-slate-700"
											}`}>
												{(report.headDecision === "APPROVED" || report.status === "APPROVED") ? "Approved" : 
												 (report.headDecision === "REJECTED_TO_REQUESTER" || report.status === "REJECTED") ? "Reject to Requester" : 
												 (report.headDecision === "RETURNED_FOR_TESTING" || report.retestFlag) ? "Returned for Testing" :
												 report.headDecision || report.status}
											</span>
										</td>
										<td className="px-8 py-5 text-right">
											<a
												href={`/api/reports/test-plan/${report.id}`}
												target="_blank"
												className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
											>
												<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
												PDF Report
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Decision Modal */}
			{decisionTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-10 animate-in zoom-in-95 duration-200">
						<div className="flex flex-col items-center text-center mb-8">
							<div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl ${decisionTarget.action === "APPROVE" ? "bg-emerald-50 text-emerald-600" :
									decisionTarget.action === "RETURN_TO_TESTING" ? "bg-amber-50 text-amber-600" :
										"bg-rose-50 text-rose-600"
								}`}>
								{decisionTarget.action === "APPROVE" ? (
									<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
								) : decisionTarget.action === "RETURN_TO_TESTING" ? (
									<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
								) : (
									<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
								)}
							</div>
							<h3 className="text-2xl font-black text-slate-900 tracking-tight">{decisionTarget.title}</h3>
							<p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">ID: #{decisionTarget.id.toString().padStart(4, '0')}</p>
						</div>

						<div className="space-y-4 mb-8">
							<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Final Remarks (Optional)</label>
							<textarea
								value={remarks}
								onChange={(e) => setRemarks(e.target.value)}
								className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300 min-h-[120px]"
								placeholder="Enter any concluding observations..."
							/>
						</div>

						<div className="flex gap-4">
							<button
								onClick={() => setDecisionTarget(null)}
								disabled={submitting}
								className="flex-1 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
							>
								Cancel
							</button>
							<button
								onClick={submitDecision}
								disabled={submitting}
								className={`flex-[2] px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${decisionTarget.action === "APPROVE" ? "bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700" :
										decisionTarget.action === "RETURN_TO_TESTING" ? "bg-amber-600 shadow-amber-500/20 hover:bg-amber-700" :
											"bg-rose-600 shadow-rose-500/20 hover:bg-rose-700"
									}`}
							>
								{submitting ? "Processing..." : `Confirm ${decisionTarget.title.split(" ")[0]}`}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
