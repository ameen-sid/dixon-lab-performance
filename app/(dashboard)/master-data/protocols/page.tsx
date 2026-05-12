"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type Protocol = {
	id: number;
	name: string;
	testTypeId: number | null;
	testType: { name: string } | null;
	testCategoryId: number | null;
	testCategory: { name: string } | null;
	productType: string;
	testMethod: string;
	judgementCriteria: string;
	createdAt: string;
};

type TestType = { id: number; name: string };
type TestCategory = { id: number; name: string; testTypeId: number | null };

const EMPTY_FORM = {
	name: "",
	testTypeId: "",
	testCategoryId: "",
	productType: "SATL",
	testMethod: "",
	judgementCriteria: "",
};

export default function ProtocolManagement() {
	const [protocols, setProtocols] = useState<Protocol[]>([]);
	const [testTypes, setTestTypes] = useState<TestType[]>([]);
	const [allCategories, setAllCategories] = useState<TestCategory[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<Protocol | null>(null);
	const [form, setForm] = useState({ ...EMPTY_FORM });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
	const [testTypeFilter, setTestTypeFilter] = useState("");
	const [testCategoryFilter, setTestCategoryFilter] = useState("");

	const filteredProtocols = useMemo(() => {
		return protocols.filter(p => {
			const matchesType = !testTypeFilter || p.testTypeId?.toString() === testTypeFilter;
			const matchesCategory = !testCategoryFilter || p.testCategoryId?.toString() === testCategoryFilter;
			return matchesType && matchesCategory;
		});
	}, [protocols, testTypeFilter, testCategoryFilter]);

	const categoriesForFilter = useMemo(() => {
		if (!testTypeFilter) return [];
		return allCategories.filter(c => c.testTypeId === parseInt(testTypeFilter));
	}, [allCategories, testTypeFilter]);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [pRes, tRes, cRes] = await Promise.all([
				fetch("/api/master-data/protocols"),
				fetch("/api/master-data/test-types"),
				fetch("/api/master-data/test-categories")
			]);
			if (pRes.ok) setProtocols(await pRes.json());
			if (tRes.ok) setTestTypes(await tRes.json());
			if (cRes.ok) setAllCategories(await cRes.json());
		} catch { /* silently fail */ }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { fetchData(); }, [fetchData]);

	// Filtered categories based on selected Test Type
	const filteredCategories = useMemo(() => {
		if (!form.testTypeId) return [];
		return allCategories.filter(c => c.testTypeId === parseInt(form.testTypeId));
	}, [allCategories, form.testTypeId]);

	const openAdd = () => {
		setEditTarget(null);
		setForm({ ...EMPTY_FORM });
		setError("");
		setShowModal(true);
	};

	const openEdit = (p: Protocol) => {
		setEditTarget(p);
		setForm({
			name: p.name,
			testTypeId: p.testTypeId?.toString() || "",
			testCategoryId: p.testCategoryId?.toString() || "",
			productType: p.productType || "",
			testMethod: p.testMethod,
			judgementCriteria: p.judgementCriteria,
		});
		setError("");
		setShowModal(true);
	};

	const toggleType = (type: string) => {
		const current = form.productType.split(",").map(t => t.trim()).filter(Boolean);
		let next;
		if (current.includes(type)) {
			next = current.filter(t => t !== type).join(", ");
		} else {
			next = [...current, type].join(", ");
		}
		set("productType", next);
	};

	const set = (field: string, value: string) => {
		setForm((prev) => {
			const next = { ...prev, [field]: value };
			// Reset category if type changes
			if (field === "testTypeId") {
				next.testCategoryId = "";
			}
			return next;
		});
		setError("");
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name || !form.testMethod || !form.judgementCriteria) {
			setError("Protocol Name, Test Method, and Judgement Criteria are required.");
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
				fetchData();
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
				fetchData();
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
					className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Add Protocol
				</button>
			</div>

			{/* Filters */}
			<div className="mb-8 flex flex-wrap items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
				<div className="flex items-center gap-2">
					<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
					</svg>
					<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter By:</span>
				</div>

				<select
					value={testTypeFilter}
					onChange={(e) => { setTestTypeFilter(e.target.value); setTestCategoryFilter(""); }}
					className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
				>
					<option value="">All Test Types</option>
					{testTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
				</select>

				<select
					value={testCategoryFilter}
					onChange={(e) => setTestCategoryFilter(e.target.value)}
					disabled={!testTypeFilter}
					className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 transition-all disabled:opacity-30 cursor-pointer"
				>
					<option value="">All Categories</option>
					{categoriesForFilter.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
				</select>

				{(testTypeFilter || testCategoryFilter) && (
					<button
						onClick={() => { setTestTypeFilter(""); setTestCategoryFilter(""); }}
						className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline cursor-pointer"
					>
						Clear Filters
					</button>
				)}

				<div className="ml-auto">
					<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
						{filteredProtocols.length} Protocols
					</span>
				</div>
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
			) : filteredProtocols.length === 0 ? (
				<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-16 text-center">
					<p className="font-bold text-slate-500 uppercase tracking-widest text-xs">No protocols match your filters</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{filteredProtocols.map((p, idx) => (
						<div
							key={p.id}
							className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group relative overflow-hidden"
						>
							<div className="flex justify-between items-start mb-4 relative z-10">
								<div className="flex items-center gap-4">
									<div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${ICON_COLORS[idx % ICON_COLORS.length]}`}>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
									</div>
									<div>
										<h3 className="text-base font-bold text-slate-900">{p.name}</h3>
										<p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
											{p.testType?.name} • {p.testCategory?.name}
										</p>
										<div className="flex flex-wrap items-center gap-1.5 mt-1">
											{(p.productType || "").split(",").map(type => type.trim()).filter(Boolean).map(t => (
												<span key={t} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
													{t}
												</span>
											))}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button onClick={() => openEdit(p)} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</button>
									<button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
									</button>
								</div>
							</div>

							<p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
								{p.judgementCriteria}
							</p>

							<div className="flex items-center justify-between pt-4 border-t border-slate-100">
								<span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
									{new Date(p.createdAt).toLocaleDateString()}
								</span>
								<button
									onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
									className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
								>
									{expandedId === p.id ? "Collapse" : "View Details"}
								</button>
							</div>

							{expandedId === p.id && (
								<div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
									<div>
										<p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Test Method / Condition</p>
										<p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{p.testMethod || "—"}</p>
									</div>
									<div>
										<p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Judgement Criteria</p>
										<p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{p.judgementCriteria}</p>
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
					<div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
							<h3 className="text-white font-bold">{editTarget ? "Edit Protocol" : "Add New Protocol"}</h3>
							<button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form onSubmit={handleSave} className="p-8 space-y-5">
							{error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">{error}</div>}

							<div>
								<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Protocol Name <span className="text-red-500">*</span></label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => set("name", e.target.value)}
									autoFocus
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold"
									placeholder="e.g. Wash Motor Endurance Test"
								/>
							</div>

							<div className="grid grid-cols-2 gap-5">
								<div>
									<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Test Type <span className="text-red-500">*</span></label>
									<select
										value={form.testTypeId}
										onChange={(e) => set("testTypeId", e.target.value)}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold cursor-pointer"
									>
										<option value="">Select Type...</option>
										{testTypes.map(t => (
											<option key={t.id} value={t.id}>{t.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Test Category <span className="text-red-500">*</span></label>
									<select
										value={form.testCategoryId}
										onChange={(e) => set("testCategoryId", e.target.value)}
										disabled={!form.testTypeId}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold disabled:opacity-50 cursor-pointer"
									>
										<option value="">Select Category...</option>
										{filteredCategories.map(c => (
											<option key={c.id} value={c.id}>{c.name}</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Product Type <span className="text-red-500">*</span></label>
								<div className="grid grid-cols-3 gap-3">
									{["SATL", "FATL", "FAFL"].map((type) => {
										const isSelected = form.productType.split(",").map(t => t.trim()).includes(type);
										return (
											<button
												key={type}
												type="button"
												onClick={() => toggleType(type)}
												className={`py-3 rounded-2xl text-[10px] font-black transition-all border-2 cursor-pointer ${isSelected
													? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20"
													: "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
													}`}
											>
												{type}
											</button>
										);
									})}
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Test Method / Condition <span className="text-red-500">*</span></label>
								<textarea rows={4} value={form.testMethod} onChange={(e) => set("testMethod", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="e.g. Set wash timer for 15 mins..." />
							</div>
							<div>
								<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Judgement Criteria <span className="text-red-500">*</span></label>
								<textarea rows={4} value={form.judgementCriteria} onChange={(e) => set("judgementCriteria", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="e.g. Motor must complete 1000 cycles without failure..." />
							</div>
							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm cursor-pointer">Cancel</button>
								<button type="submit" disabled={saving} className="bg-slate-900 text-white font-bold py-3 px-10 rounded-2xl shadow-2xl shadow-slate-900/30 transition-all text-sm hover:bg-slate-800 disabled:bg-slate-400 cursor-pointer">
									{saving ? "Saving..." : (editTarget ? "Update Protocol" : "Add Protocol")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirm */}
			{deleteConfirm !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
						<div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4">
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<h3 className="text-xl font-bold text-slate-900 mb-2">Delete Protocol?</h3>
						<div className="flex gap-3 mt-6">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 text-sm transition-all cursor-pointer">Cancel</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-lg shadow-rose-500/20 cursor-pointer">Delete</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
