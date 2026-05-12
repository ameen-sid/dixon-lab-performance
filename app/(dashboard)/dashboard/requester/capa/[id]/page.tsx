"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

export default function CapaDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [report, setReport] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		async function fetchDetail() {
			try {
				const res = await fetch(`/api/capa/${params.id}`);
				if (res.ok) {
					setReport(await res.json());
				} else {
					setError("Report not found or access denied.");
				}
			} catch (e) {
				setError("Failed to load report.");
			} finally {
				setLoading(false);
			}
		}
		if (params.id) fetchDetail();
	}, [params.id]);

	if (loading) return (
		<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
			<div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
			<p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading RCA details...</p>
		</div>
	);

	if (error || !report) return (
		<div className="max-w-2xl mx-auto py-20 text-center">
			<div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-rose-600 shadow-xl shadow-rose-500/10">
				<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			</div>
			<h2 className="text-2xl font-black text-slate-900 mb-4">{error || "Report not found"}</h2>
			<Link href="/dashboard/requester/capa" className="text-blue-600 font-bold hover:underline">Go back to list</Link>
		</div>
	);

	return (
		<div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Breadcrumb */}
			<div className="mb-8 flex items-center gap-3">
				<Link href="/dashboard/requester/capa" className="text-slate-400 hover:text-slate-900 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
					Back to CAPA Management
				</Link>
			</div>

			<div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden">
				{/* Header Section */}
				<div className="p-12 bg-slate-900 text-white relative overflow-hidden">
					<div className="relative z-10">
						<div className="flex items-center gap-3 mb-4">
							<span className="px-3 py-1 bg-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/30">
								{report.testPlan.testCategory.name}
							</span>
							<span className="px-3 py-1 bg-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/30 text-white">
								{report.status}
							</span>
						</div>
						<h1 className="text-4xl font-black tracking-tight mb-2">{report.testPlan.testProtocol.name}</h1>
						<p className="text-slate-400 font-bold text-sm tracking-wide">
							Submitted on {format(new Date(report.createdAt), "dd MMMM yyyy, p")}
						</p>
					</div>
					<div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
				</div>

				<div className="p-12 space-y-12">
					{/* Related Request Info */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
						<div>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sample / Part Name</p>
							<p className="text-lg font-black text-slate-900">{report.testPlan.inspectionResult?.testRequest?.samplePartName || "—"}</p>
							<p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{report.testPlan.inspectionResult?.testRequest?.samplePartNo || "No Part Number"}</p>
						</div>
						<div>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Model Identification</p>
							<p className="text-lg font-black text-slate-900">{report.testPlan.inspectionResult?.testRequest?.modelIdentification || "—"}</p>
							<p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Test: {report.testPlan.inspectionResult?.testRequest?.testName || "—"}</p>
						</div>
					</div>

					{/* Analysis Details */}
					<div className="space-y-10">
						<section className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 font-black text-xs">01</div>
								<h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Observed Problem</h2>
							</div>
							<div className="pl-11">
								<p className="text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
									{report.problem}
								</p>
							</div>
						</section>

						<section className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 font-black text-xs">02</div>
								<h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Root Cause Analysis</h2>
							</div>
							<div className="pl-11">
								<p className="text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
									{report.rootCause}
								</p>
							</div>
						</section>

						<section className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 font-black text-xs">03</div>
								<h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Corrective Action Taken</h2>
							</div>
							<div className="pl-11">
								<p className="text-slate-700 leading-relaxed font-medium bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
									{report.actionTaken}
								</p>
							</div>
						</section>
					</div>

					{/* Footer/Action */}
					<div className="pt-8 border-t border-slate-100 flex justify-between items-center">
						<div>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Status</p>
							<p className="text-sm font-bold text-slate-900 mt-1">This report is currently {report.status.toLowerCase()}.</p>
						</div>
						<button 
							onClick={() => window.print()}
							className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
							Print Report
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
