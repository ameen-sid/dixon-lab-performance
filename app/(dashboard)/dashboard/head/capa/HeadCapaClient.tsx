"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

type CapaReport = {
	id: number;
	problem: string;
	rootCause: string;
	actionTaken: string;
	status: string;
	createdAt: string;
	submittedBy?: { name: string; role: string };
	testPlan: {
		testProtocol: { name: string };
		testCategory: { name: string };
		inspectionResult?: {
			testRequest: {
				samplePartName: string;
				samplePartNo: string;
				modelIdentification: string;
				testName: string;
			}
		} | null;
	};
};

export default function HeadCapaClient() {
	const [reports, setReports] = useState<CapaReport[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		startDate: "",
		endDate: "",
		submitter: ""
	});

	useEffect(() => {
		fetchReports();
	}, []);

	async function fetchReports() {
		try {
			const res = await fetch("/api/head/capa");
			if (res.ok) setReports(await res.json());
		} catch (e) { console.error(e); }
		finally { setLoading(false); }
	}

	const filteredReports = reports.filter(r => {
		const rDate = new Date(r.createdAt).getTime();
		const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
		const end = filters.endDate ? new Date(filters.endDate).getTime() : Infinity;
		
		if (rDate < start || rDate > (end + 86400000)) return false;
		if (filters.submitter && !r.submittedBy?.name.toLowerCase().includes(filters.submitter.toLowerCase())) return false;
		
		return true;
	});

	return (
		<div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
			{/* Page Header */}
			<div className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
				<div className="space-y-2">
					<div className="flex items-center gap-3 mb-1">
						<div className="w-2 h-8 bg-blue-600 rounded-full" />
						<h2 className="text-4xl font-black text-slate-900 tracking-tight">CAPA Reports Oversight</h2>
					</div>
					<p className="text-slate-500 font-bold text-lg max-w-2xl">
						Monitor all Corrective and Preventive Actions across the laboratory with precision.
					</p>
				</div>
				
				{/* Modern Unified Filter Bar */}
				<div className="flex flex-wrap items-center gap-4 p-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)]">
					<div className="relative group/input">
						<svg className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input 
							type="text" 
							placeholder="Search Submitter..."
							value={filters.submitter}
							onChange={(e) => setFilters(f => ({ ...f, submitter: e.target.value }))}
							className="pl-12 pr-6 py-3.5 bg-slate-50/50 border border-transparent focus:bg-white focus:border-blue-100 rounded-2xl text-sm font-bold text-slate-700 outline-none w-56 transition-all"
						/>
					</div>

					<div className="h-10 w-px bg-slate-100 mx-1 hidden md:block" />

					<div className="flex items-center gap-3 bg-slate-50/50 p-1.5 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
						<div className="flex flex-col px-3">
							<span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">From Date</span>
							<input 
								type="date" 
								value={filters.startDate}
								onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
								className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer hover:text-blue-600 transition-colors"
							/>
						</div>
						<div className="w-4 h-px bg-slate-200" />
						<div className="flex flex-col px-3">
							<span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">To Date</span>
							<input 
								type="date" 
								value={filters.endDate}
								onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
								className="bg-transparent text-xs font-black text-slate-700 outline-none cursor-pointer hover:text-blue-600 transition-colors"
							/>
						</div>
					</div>

					{(filters.startDate || filters.endDate || filters.submitter) && (
						<button 
							onClick={() => setFilters({ startDate: "", endDate: "", submitter: "" })}
							className="px-6 py-2 text-[10px] font-black text-rose-500 hover:bg-rose-50 rounded-xl transition-all uppercase tracking-widest cursor-pointer"
						>
							Reset
						</button>
					)}
				</div>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 gap-6">
					<div className="bg-white rounded-[3rem] p-12 border border-slate-100 animate-pulse h-96" />
				</div>
			) : filteredReports.length === 0 ? (
				<div className="bg-white rounded-[3rem] p-24 border border-slate-100 shadow-sm text-center">
					<div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-slate-200 shadow-xl shadow-slate-500/5 rotate-3">
						<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</div>
					<h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Matching Reports</h3>
					<p className="text-slate-400 font-bold max-w-md mx-auto text-lg leading-relaxed">
						We couldn't find any CAPA reports matching your current filter criteria.
					</p>
				</div>
			) : (
				<div className="bg-white rounded-[3rem] shadow-[0_32px_64px_rgb(0,0,0,0.02)] border border-slate-100/80 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-slate-50/30 border-b border-slate-100/50">
									<th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol / Category</th>
									<th className="px-8 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitter</th>
									<th className="px-8 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Identification</th>
									<th className="px-8 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Audit Status</th>
									<th className="px-10 py-7 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Submission</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100/50">
								{filteredReports.map((r) => (
									<tr 
										key={r.id} 
										onClick={() => window.location.href = `/dashboard/head/capa/${r.id}`}
										className="hover:bg-slate-50/80 transition-all cursor-pointer group"
									>
										<td className="px-8 py-6">
											<p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">{r.testPlan.testProtocol.name}</p>
											<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{r.testPlan.testCategory.name}</p>
										</td>
										<td className="px-6 py-6">
											<p className="text-sm font-bold text-slate-700">{r.submittedBy?.name}</p>
											<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.submittedBy?.role}</p>
										</td>
										<td className="px-6 py-6">
											<p className="text-xs font-bold text-slate-600">{r.testPlan.inspectionResult?.testRequest.samplePartName || "—"}</p>
											<p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mt-1">
												{r.testPlan.inspectionResult?.testRequest.samplePartNo} {r.testPlan.inspectionResult?.testRequest.modelIdentification ? `| ${r.testPlan.inspectionResult.testRequest.modelIdentification}` : ""}
											</p>
										</td>
										<td className="px-6 py-6 text-center">
											<span className="inline-flex px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-full uppercase tracking-tighter">
												{r.status}
											</span>
										</td>
										<td className="px-8 py-6 text-right">
											<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
												{format(new Date(r.createdAt), "dd MMM yyyy")}
											</p>
											<p className="text-[9px] font-bold text-slate-300 mt-0.5">{format(new Date(r.createdAt), "HH:mm")}</p>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
