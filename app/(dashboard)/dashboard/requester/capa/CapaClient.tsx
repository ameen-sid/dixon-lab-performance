"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";

type CapaReport = {
	id: number;
	testPlanId: number;
	problem: string;
	rootCause: string;
	actionTaken: string;
	status: string;
	createdAt: string;
	testPlan: {
		testProtocol: { name: string };
		testCategory: { name: string };
	};
};

type EligiblePlan = {
	id: number;
	testProtocol: { name: string };
	testCategory: { name: string };
	inspectionResult?: {
		testRequest: {
			samplePartName: string;
			samplePartNo: string | null;
			modelIdentification: string | null;
			testName: string;
		}
	} | null;
};

export default function CapaClient() {
	const [reports, setReports] = useState<CapaReport[]>([]);
	const [eligiblePlans, setEligiblePlans] = useState<EligiblePlan[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const [form, setForm] = useState({
		testPlanId: "",
		problem: "",
		rootCause: "",
		actionTaken: ""
	});

	useEffect(() => {
		fetchReports();
		fetchEligiblePlans();
	}, []);

	async function fetchReports() {
		try {
			const res = await fetch("/api/capa");
			if (res.ok) setReports(await res.json());
		} catch (e) { console.error(e); }
		finally { setLoading(false); }
	}

	async function fetchEligiblePlans() {
		try {
			const res = await fetch("/api/requester/eligible-plans");
			if (res.ok) setEligiblePlans(await res.json());
		} catch (e) { console.error(e); }
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.testPlanId || !form.problem || !form.rootCause || !form.actionTaken) {
			setError("All fields are required.");
			return;
		}
		setSaving(true);
		setError("");
		try {
			const res = await fetch("/api/capa", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form)
			});
			if (res.ok) {
				setShowModal(false);
				setForm({ testPlanId: "", problem: "", rootCause: "", actionTaken: "" });
				fetchReports();
			} else {
				const d = await res.json();
				setError(d.error || "Failed to save.");
			}
		} catch { setError("Network error."); }
		finally { setSaving(false); }
	};

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
				<div>
					<h2 className="text-3xl font-black text-slate-900 tracking-tight">CAPA Management</h2>
					<p className="text-slate-500 font-bold mt-2">Corrective and Preventive Actions tracking for your requests.</p>
				</div>
				<button
					onClick={() => setShowModal(true)}
					className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-95 flex items-center gap-2 cursor-pointer"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
					</svg>
					New RCA Report
				</button>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 gap-6">
					{[1, 2, 3].map(i => (
						<div key={i} className="h-32 bg-white rounded-3xl border border-slate-100 animate-pulse" />
					))}
				</div>
			) : reports.length === 0 ? (
				<div className="bg-white rounded-[2.5rem] p-16 border border-slate-100 shadow-sm text-center">
					<div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-xl shadow-blue-500/10">
						<svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<h3 className="text-2xl font-black text-slate-900 mb-4">No CAPA Reports Found</h3>
					<p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
						You haven't submitted any Corrective and Preventive Action reports yet. Click the button above to start your first analysis.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6">
					{reports.map((r) => (
						<Link key={r.id} href={`/dashboard/requester/capa/${r.id}`} className="block group">
							<div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:border-blue-100 transition-all transform group-hover:-translate-y-1">
								<div className="flex justify-between items-start mb-6">
									<div>
										<div className="flex items-center gap-3 mb-2">
											<span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{r.testPlan.testCategory.name}</span>
											<span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full uppercase tracking-tighter">
												{r.status}
											</span>
										</div>
										<h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{r.testPlan.testProtocol.name}</h3>
									</div>
									<div className="flex flex-col items-end gap-1">
										<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
											{format(new Date(r.createdAt), "dd MMM yyyy")}
										</span>
										<div className="flex items-center gap-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
											<span className="text-[9px] font-bold uppercase tracking-widest">View Full Details</span>
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
									<div className="space-y-2">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observed Problem</p>
										<p className="text-sm font-medium text-slate-700 leading-relaxed line-clamp-2">{r.problem}</p>
									</div>
									<div className="space-y-2">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Root Cause</p>
										<p className="text-sm font-medium text-slate-700 leading-relaxed line-clamp-2">{r.rootCause}</p>
									</div>
									<div className="space-y-2">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Taken</p>
										<p className="text-sm font-medium text-slate-700 leading-relaxed line-clamp-2">{r.actionTaken}</p>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}

			{/* New RCA Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
					<div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 animate-in zoom-in-95 duration-200 no-scrollbar">
						<div className="flex justify-between items-center mb-8">
							<h3 className="text-2xl font-black text-slate-900 tracking-tight">New Root Cause Analysis</h3>
							<button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 cursor-pointer">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							{error && <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}

							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Select Failed Test Plan</label>
								<select
									value={form.testPlanId}
									onChange={(e) => setForm(f => ({ ...f, testPlanId: e.target.value }))}
									className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer"
								>
									<option value="">Select a plan...</option>
									{eligiblePlans.map(p => (
										<option key={p.id} value={p.id}>
											{p.testProtocol.name} | {p.inspectionResult?.testRequest?.samplePartName || "No Part"} 
											{p.inspectionResult?.testRequest?.samplePartNo ? ` [${p.inspectionResult.testRequest.samplePartNo}]` : ""} 
											{p.inspectionResult?.testRequest?.modelIdentification ? ` - ${p.inspectionResult.testRequest.modelIdentification}` : ""} 
											({p.inspectionResult?.testRequest?.testName || "No Test"})
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Observed Problem</label>
								<textarea
									value={form.problem}
									onChange={(e) => setForm(f => ({ ...f, problem: e.target.value }))}
									rows={3}
									className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
									placeholder="Describe the failure or abnormality observed..."
								/>
							</div>

							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Root Cause Analysis (RCA)</label>
								<textarea
									value={form.rootCause}
									onChange={(e) => setForm(f => ({ ...f, rootCause: e.target.value }))}
									rows={3}
									className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
									placeholder="Identify why the failure happened (5-Whys analysis)..."
								/>
							</div>

							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Corrective Action Taken</label>
								<textarea
									value={form.actionTaken}
									onChange={(e) => setForm(f => ({ ...f, actionTaken: e.target.value }))}
									rows={3}
									className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
									placeholder="What steps were taken to fix it and prevent recurrence?"
								/>
							</div>

							<div className="flex gap-4 pt-4">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="flex-1 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all cursor-pointer"
								>
									Discard
								</button>
								<button
									type="submit"
									disabled={saving}
									className="flex-[2] px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
								>
									{saving ? "Submitting..." : "Submit RCA Report"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
