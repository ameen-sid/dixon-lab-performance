"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

type DailyLog = {
	id: number;
	logDate: string;
	noOfWashCycle: number | null;
	noOfSpinCycle: number | null;
	sealBellow: string | null;
	washTimer: string | null;
	gearBox: string | null;
	pulsator: string | null;
	washCurrentCycle: string | null;
	spinCurrentCycle: string | null;
	remarks: string | null;
};

type ReliabilityTest = {
	id: number;
	modelCap: string;
	partName: string;
	vendor: string;
	clothLoad: string;
	startDate: string;
	status: string;
	dailyLogs: DailyLog[];
};

function formatDate(d: string) {
	return new Date(d).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

const STATUS_MAP = {
	ONGOING: { label: "Ongoing", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500 animate-pulse" },
	COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
	FAILED: { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

const EMPTY_LOG = {
	logDate: "",
	noOfWashCycle: "",
	noOfSpinCycle: "",
	sealBellow: "",
	washTimer: "",
	gearBox: "",
	pulsator: "",
	washCurrentCycle: "",
	spinCurrentCycle: "",
	remarks: "",
};

export default function ReliabilityCycleDetail() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [test, setTest] = useState<ReliabilityTest | null>(null);
	const [loading, setLoading] = useState(true);
	const [showLogModal, setShowLogModal] = useState(false);
	const [logForm, setLogForm] = useState({ ...EMPTY_LOG });
	const [logLoading, setLogLoading] = useState(false);
	const [logError, setLogError] = useState("");
	const [logSuccess, setLogSuccess] = useState(false);

	const fetchTest = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch(`/api/reports/reliability/${id}`);
			if (res.ok) {
				const data = await res.json();
				setTest(data);
			}
		} catch {
			// no-op
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchTest();
	}, [fetchTest]);

	const handleLogChange = (field: string, value: string) => {
		setLogForm((prev) => ({ ...prev, [field]: value }));
		setLogError("");
	};

	const handleLogSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!logForm.logDate) {
			setLogError("Log Date is required.");
			return;
		}
		setLogLoading(true);
		try {
			const res = await fetch(`/api/reports/reliability/${id}/logs`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...logForm,
					noOfWashCycle: logForm.noOfWashCycle ? parseInt(logForm.noOfWashCycle) : null,
					noOfSpinCycle: logForm.noOfSpinCycle ? parseInt(logForm.noOfSpinCycle) : null,
				}),
			});
			if (res.ok) {
				setLogSuccess(true);
				setLogForm({ ...EMPTY_LOG });
				setTimeout(() => {
					setShowLogModal(false);
					setLogSuccess(false);
					fetchTest();
				}, 1000);
			} else {
				const d = await res.json();
				setLogError(d.error || "Failed to save log.");
			}
		} catch {
			setLogError("Network error.");
		} finally {
			setLogLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto pb-12">
				<div className="h-8 w-48 bg-slate-100 rounded-xl mb-4 animate-pulse" />
				<div className="bg-white rounded-3xl h-64 animate-pulse" />
			</div>
		);
	}

	if (!test) {
		return (
			<div className="max-w-6xl mx-auto pb-12 text-center py-20">
				<p className="text-slate-400 font-semibold">Reliability cycle not found.</p>
				<button onClick={() => router.back()} className="mt-4 text-blue-600 font-semibold hover:underline">← Go Back</button>
			</div>
		);
	}

	const statusInfo = STATUS_MAP[test.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.ONGOING;
	const totalWash = test.dailyLogs.reduce((s, l) => s + (l.noOfWashCycle ?? 0), 0);
	const totalSpin = test.dailyLogs.reduce((s, l) => s + (l.noOfSpinCycle ?? 0), 0);

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Back */}
			<button
				onClick={() => router.back()}
				className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium text-sm mb-6 transition-colors group"
			>
				<svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
				</svg>
				Back to Reliability Cycles
			</button>

			{/* Header Card */}
			<div className="bg-slate-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
				<div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				<div className="relative z-10">
					<div className="flex flex-wrap justify-between items-start gap-4">
						<div>
							<p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-2">
								Cycle #{test.id} · {test.vendor}
							</p>
							<h2 className="text-2xl font-extrabold tracking-tight mb-1">{test.partName}</h2>
							<p className="text-slate-400 font-medium">{test.modelCap} · {test.clothLoad}</p>
						</div>
						<div className="flex items-center gap-3">
							<span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${statusInfo.cls}`}>
								<span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
								{statusInfo.label}
							</span>
						</div>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
						<div className="bg-white/5 rounded-2xl p-4 border border-white/10">
							<p className="text-slate-400 text-xs font-semibold mb-1">Start Date</p>
							<p className="text-white font-bold">{formatDate(test.startDate)}</p>
						</div>
						<div className="bg-white/5 rounded-2xl p-4 border border-white/10">
							<p className="text-slate-400 text-xs font-semibold mb-1">Total Days Logged</p>
							<p className="text-white font-bold">{test.dailyLogs.length}</p>
						</div>
						<div className="bg-white/5 rounded-2xl p-4 border border-white/10">
							<p className="text-slate-400 text-xs font-semibold mb-1">Total Wash Cycles</p>
							<p className="text-white font-bold">{totalWash.toLocaleString()}</p>
						</div>
						<div className="bg-white/5 rounded-2xl p-4 border border-white/10">
							<p className="text-slate-400 text-xs font-semibold mb-1">Total Spin Cycles</p>
							<p className="text-white font-bold">{totalSpin.toLocaleString()}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Daily Logs Table */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
				<div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
					<div>
						<h3 className="text-lg font-bold text-slate-900">Daily Logs</h3>
						<p className="text-sm text-slate-500 mt-0.5">{test.dailyLogs.length} entries recorded</p>
					</div>
					<button
						onClick={() => setShowLogModal(true)}
						className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 text-sm"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Add Today&apos;s Log
					</button>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse text-sm">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
								<th className="px-5 py-3.5 font-bold border-b border-slate-200 whitespace-nowrap">Date</th>
								<th className="px-5 py-3.5 font-bold border-b border-slate-200 whitespace-nowrap">Wash Cycles</th>
								<th className="px-5 py-3.5 font-bold border-b border-slate-200 whitespace-nowrap">Spin Cycles</th>
								<th className="px-5 py-3.5 font-bold border-b border-slate-200 whitespace-nowrap">Seal/Bellow</th>
								<th className="px-5 py-3.5 font-bold border-b border-slate-200 whitespace-nowrap">Wash Timer</th>
								<th className="px-5 py-3.5 font-bold border-b border-slate-200 whitespace-nowrap">Gear Box</th>
								<th className="px-5 py-3.5 font-bold border-b border-slate-200 whitespace-nowrap">Pulsator</th>
								<th className="px-5 py-3.5 font-bold border-b border-slate-200 whitespace-nowrap">Remarks</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{test.dailyLogs.length === 0 ? (
								<tr>
									<td colSpan={8} className="px-6 py-16 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
												<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
											</div>
											<p className="font-bold text-slate-500">No daily logs yet</p>
											<p className="text-sm text-slate-400">Click &ldquo;Add Today&apos;s Log&rdquo; to begin tracking.</p>
										</div>
									</td>
								</tr>
							) : (
								[...test.dailyLogs].reverse().map((log) => (
									<tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
										<td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{formatDate(log.logDate)}</td>
										<td className="px-5 py-3.5 text-slate-600">{log.noOfWashCycle ?? "—"}</td>
										<td className="px-5 py-3.5 text-slate-600">{log.noOfSpinCycle ?? "—"}</td>
										<td className="px-5 py-3.5 text-slate-600">{log.sealBellow || "—"}</td>
										<td className="px-5 py-3.5 text-slate-600">{log.washTimer || "—"}</td>
										<td className="px-5 py-3.5 text-slate-600">{log.gearBox || "—"}</td>
										<td className="px-5 py-3.5 text-slate-600">{log.pulsator || "—"}</td>
										<td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{log.remarks || "—"}</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add Log Modal */}
			{showLogModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center rounded-t-3xl">
							<h3 className="text-white font-bold flex items-center gap-2">
								<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
								Add Daily Log Entry
							</h3>
							<button onClick={() => { setShowLogModal(false); setLogError(""); setLogForm({ ...EMPTY_LOG }); }} className="text-slate-400 hover:text-white transition-colors">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<form onSubmit={handleLogSubmit} className="p-8 space-y-6">
							{logError && (
								<div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">
									{logError}
								</div>
							)}
							{logSuccess && (
								<div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 font-medium flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
									Log saved successfully!
								</div>
							)}

							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2">
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Log Date <span className="text-red-500">*</span></label>
									<input type="date" value={logForm.logDate} onChange={(e) => handleLogChange("logDate", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">No. of Wash Cycles</label>
									<input type="number" min="0" value={logForm.noOfWashCycle} onChange={(e) => handleLogChange("noOfWashCycle", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="0" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">No. of Spin Cycles</label>
									<input type="number" min="0" value={logForm.noOfSpinCycle} onChange={(e) => handleLogChange("noOfSpinCycle", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="0" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Seal / Bellow</label>
									<input type="text" value={logForm.sealBellow} onChange={(e) => handleLogChange("sealBellow", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="OK / Damaged" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Wash Timer</label>
									<input type="text" value={logForm.washTimer} onChange={(e) => handleLogChange("washTimer", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. 45 min" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Gear Box</label>
									<input type="text" value={logForm.gearBox} onChange={(e) => handleLogChange("gearBox", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="OK / Issue" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Pulsator</label>
									<input type="text" value={logForm.pulsator} onChange={(e) => handleLogChange("pulsator", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="OK / Issue" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Wash Current Cycle</label>
									<input type="text" value={logForm.washCurrentCycle} onChange={(e) => handleLogChange("washCurrentCycle", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. 2.5 A" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Spin Current Cycle</label>
									<input type="text" value={logForm.spinCurrentCycle} onChange={(e) => handleLogChange("spinCurrentCycle", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. 1.8 A" />
								</div>
								<div className="col-span-2">
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Remarks</label>
									<textarea rows={3} value={logForm.remarks} onChange={(e) => handleLogChange("remarks", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Any observations or issues..." />
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => { setShowLogModal(false); setLogError(""); setLogForm({ ...EMPTY_LOG }); }} className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm">
									Cancel
								</button>
								<button type="submit" disabled={logLoading || logSuccess} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 text-sm">
									{logLoading ? (
										<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
									) : "Save Log"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
