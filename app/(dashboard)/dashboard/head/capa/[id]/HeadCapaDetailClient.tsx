"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";

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
				testStandard: string;
				testPurpose: string;
			}
		} | null;
	};
};

export default function HeadCapaDetailClient() {
	const params = useParams();
	const [report, setReport] = useState<CapaReport | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (params.id) fetchReport();
	}, [params.id]);

	async function fetchReport() {
		try {
			const res = await fetch(`/api/head/capa/${params.id}`);
			if (res.ok) setReport(await res.json());
		} catch (e) { console.error(e); }
		finally { setLoading(false); }
	}

	if (loading) return (
		<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
			<div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
			<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Analysis Details...</p>
		</div>
	);

	if (!report) return (
		<div className="text-center py-24">
			<h3 className="text-2xl font-black text-slate-900 mb-4">Report Not Found</h3>
			<Link href="/dashboard/head/capa" className="text-blue-600 font-bold hover:underline">Back to List</Link>
		</div>
	);

	return (
		<div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="mb-8 flex items-center justify-between">
				<Link 
					href="/dashboard/head/capa"
					className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-sm"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
					Back to Reports
				</Link>
				<div className="flex items-center gap-3">
					<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
					<span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-600/20">
						{report.status}
					</span>
				</div>
			</div>

			<div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
				{/* Header Info */}
				<div className="bg-slate-900 p-12 text-white">
					<div className="flex flex-col md:flex-row justify-between gap-8 items-start">
						<div>
							<div className="flex items-center gap-3 mb-4">
								<span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300">
									{report.testPlan.testCategory.name}
								</span>
								<div className="h-px w-8 bg-slate-700" />
								<span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RCA Analysis</span>
							</div>
							<h1 className="text-4xl font-black tracking-tight mb-6">{report.testPlan.testProtocol.name}</h1>
							
							<div className="flex items-center gap-6">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 font-black border border-slate-700">
										{report.submittedBy?.name?.[0] || "U"}
									</div>
									<div>
										<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submitted By</p>
										<p className="text-sm font-black text-white">{report.submittedBy?.name} ({report.submittedBy?.role})</p>
									</div>
								</div>
								<div className="h-8 w-px bg-slate-800" />
								<div>
									<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submission Date</p>
									<p className="text-sm font-black text-white">{format(new Date(report.createdAt), "dd MMMM yyyy, HH:mm")}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Technical Specs */}
				<div className="px-12 py-8 bg-slate-50 border-b border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-8">
					<div>
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Part Name</p>
						<p className="text-sm font-bold text-slate-900">{report.testPlan.inspectionResult?.testRequest.samplePartName || "—"}</p>
					</div>
					<div>
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Part Number</p>
						<p className="text-sm font-bold text-slate-900">{report.testPlan.inspectionResult?.testRequest.samplePartNo || "—"}</p>
					</div>
					<div>
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Model Identification</p>
						<p className="text-sm font-bold text-slate-900">{report.testPlan.inspectionResult?.testRequest.modelIdentification || "—"}</p>
					</div>
					<div>
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Test Name</p>
						<p className="text-sm font-bold text-slate-900">{report.testPlan.inspectionResult?.testRequest.testName || "—"}</p>
					</div>
				</div>

				{/* Detailed Analysis */}
				<div className="p-12 space-y-12">
					<section className="relative pl-10">
						<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-full" />
						<h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight flex items-center gap-3">
							<span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 text-sm">01</span>
							Problem Statement
						</h3>
						<div className="bg-amber-50/30 p-8 rounded-[2rem] border border-amber-100/50">
							<p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{report.problem}</p>
						</div>
					</section>

					<section className="relative pl-10">
						<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-full" />
						<h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight flex items-center gap-3">
							<span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-sm">02</span>
							Root Cause Analysis (RCA)
						</h3>
						<div className="bg-blue-50/30 p-8 rounded-[2rem] border border-blue-100/50">
							<p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{report.rootCause}</p>
						</div>
					</section>

					<section className="relative pl-10">
						<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-full" />
						<h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight flex items-center gap-3">
							<span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm">03</span>
							Corrective Actions
						</h3>
						<div className="bg-emerald-50/30 p-8 rounded-[2rem] border border-emerald-100/50">
							<p className="text-base font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{report.actionTaken}</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
