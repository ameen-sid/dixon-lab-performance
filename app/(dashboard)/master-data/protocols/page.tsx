"use client";

import { useState, useEffect, useCallback } from "react";

type Protocol = {
	id: number;
	testName: string;
	testCondition: string;
	testMethod: string;
	judgementCriteria: string;
	createdAt: string;
};

const EMPTY_FORM = {
	testName: "",
	testCondition: "",
	testMethod: "",
	judgementCriteria: "",
};

export default function ProtocolManagement() {
	const [protocols, setProtocols] = useState<Protocol[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<Protocol | null>(null);
	const [form, setForm] = useState({ ...EMPTY_FORM });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

	const fetchProtocols = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/master-data/protocols");
			if (res.ok) setProtocols(await res.json());
		} catch { /* silently fail */ }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { fetchProtocols(); }, [fetchProtocols]);

	const openAdd = () => {
		setEditTarget(null);
		setForm({ ...EMPTY_FORM });
		setError("");
		setShowModal(true);
	};

	const openEdit = (p: Protocol) => {
		setEditTarget(p);
		setForm({ testName: p.testName, testCondition: p.testCondition, testMethod: p.testMethod, judgementCriteria: p.judgementCriteria });
		setError("");
		setShowModal(true);
	};

	const set = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setError("");
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.testName || !form.testMethod || !form.judgementCriteria) {
			setError("Test Name, Test Method, and Judgement Criteria are required.");
			return;
		}
		setSaving(true);
		try {
			const url = editTarget ? `/api/master-data/protocols/${editTarget.id}` : "/api/master-data/protocols";
			const method = editTarget ? "PUT" : "POST";
			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (res.ok) {
				setSuccess(editTarget ? "Protocol updated!" : "Protocol added!");
				setShowModal(false);
				fetchProtocols();
				setTimeout(() => setSuccess(""), 2500);
			} else {
				const d = await res.json();
				setError(d.error || "Failed to save.");
			}
		} catch { setError("Network error."); }
		finally { setSaving(false); }
	};

	const handleDelete = async (id: number) => {
		try {
			const res = await fetch(`/api/master-data/protocols/${id}`, { method: "DELETE" });
			if (res.ok) {
				setSuccess("Protocol deleted.");
				setDeleteConfirm(null);
				fetchProtocols();
				setTimeout(() => setSuccess(""), 2500);
			}
		} catch { /* no-op */ }
	};

	const ICON_COLORS = [
		"bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
		"bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
		"bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
		"bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
		"bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
	];

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="flex justify-between items-end mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Protocols</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Manage master criteria, judgements, and testing parameters.
					</p>
				</div>
				<button
					onClick={openAdd}
					className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Add Protocol
				</button>
			</div>

			{success && (
				<div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 flex items-center gap-2 font-medium animate-in fade-in">
					<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					{success}
				</div>
			)}

			{/* Protocol Cards Grid */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="bg-white rounded-3xl border border-slate-100 h-48 animate-pulse" />
					))}
				</div>
			) : protocols.length === 0 ? (
				<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-16 text-center">
					<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-4">
						<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<p className="font-bold text-slate-500">No protocols yet</p>
					<p className="text-sm text-slate-400 mt-1">Add test protocols to auto-fill forms when selecting a test type.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{protocols.map((p, idx) => (
						<div
							key={p.id}
							className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group relative overflow-hidden"
						>
							{/* Hover glow */}
							<div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

							<div className="flex justify-between items-start mb-4 relative z-10">
								<div className="flex items-center gap-4">
									<div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${ICON_COLORS[idx % ICON_COLORS.length]}`}>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
									</div>
									<div>
										<h3 className="text-base font-bold text-slate-900">{p.testName}</h3>
										<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
											PRT-{String(p.id).padStart(3, "0")}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button onClick={() => openEdit(p)} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</button>
									<button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>

							{/* Criteria Preview */}
							<p className="text-sm text-slate-500 mb-4 line-clamp-2 relative z-10 leading-relaxed">
								{p.judgementCriteria}
							</p>

							<div className="flex items-center justify-between pt-4 border-t border-slate-100 relative z-10">
								<span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
									{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
								</span>
								<button
									onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
									className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
								>
									{expandedId === p.id ? "Collapse" : "View Details"}
									<svg className={`w-4 h-4 transition-transform ${expandedId === p.id ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</div>

							{/* Expanded Detail */}
							{expandedId === p.id && (
								<div className="mt-4 pt-4 border-t border-slate-100 space-y-3 relative z-10 animate-in fade-in duration-200">
									{p.testCondition && (
										<div>
											<p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Test Condition</p>
											<p className="text-sm text-slate-600 leading-relaxed">{p.testCondition}</p>
										</div>
									)}
									<div>
										<p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Test Method</p>
										<p className="text-sm text-slate-600 leading-relaxed">{p.testMethod || "—"}</p>
									</div>
									<div>
										<p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Judgement Criteria</p>
										<p className="text-sm text-slate-600 leading-relaxed">{p.judgementCriteria}</p>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Add / Edit Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center rounded-t-3xl sticky top-0 z-10">
							<h3 className="text-white font-bold flex items-center gap-2">
								<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								{editTarget ? "Edit Protocol" : "Add New Protocol"}
							</h3>
							<button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form onSubmit={handleSave} className="p-8 space-y-5">
							{error && (
								<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">{error}</div>
							)}
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Test Name <span className="text-red-500">*</span></label>
								<input type="text" value={form.testName} onChange={(e) => set("testName", e.target.value)} autoFocus className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. TR, Temperature rise test: Wash" />
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Test Condition</label>
								<textarea rows={3} value={form.testCondition} onChange={(e) => set("testCondition", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Keep Voltage 245V, 50Hz..." />
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Test Method <span className="text-red-500">*</span></label>
								<textarea rows={3} value={form.testMethod} onChange={(e) => set("testMethod", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Measure the contact resistance using..." />
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Judgement Criteria <span className="text-red-500">*</span></label>
								<textarea rows={3} value={form.judgementCriteria} onChange={(e) => set("judgementCriteria", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Max temp rise allowed 75°C" />
							</div>
							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm">Cancel</button>
								<button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center gap-2">
									{saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : (editTarget ? "Update Protocol" : "Add Protocol")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirm */}
			{deleteConfirm !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
						<div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-5">
							<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<h3 className="text-lg font-bold text-slate-900 mb-2">Delete Protocol?</h3>
						<p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
						<div className="flex gap-3">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 text-sm">Cancel</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm">Delete</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
