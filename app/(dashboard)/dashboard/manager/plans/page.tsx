"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { format, addDays } from "date-fns";

type Plan = {
	id: number;
	testTypeId: number;
	testType: { name: string };
	testCategoryId: number;
	testCategory: { name: string };
	testProtocolId: number;
	testProtocol: { name: string; productType: string };
	referenceStd: string | null;
	numDays: number;
	startDate: string;
	endDate: string;
	remarks: string | null;
	stationIds: string | null;
	status: string;
	createdAt: string;
};

type MasterData = {
	types: { id: number; name: string }[];
	categories: { id: number; name: string; testTypeId: number | null }[];
	protocols: { id: number; name: string; testCategoryId: number | null; productType: string }[];
	stations: { id: string; platformId: string; status: string }[];
};

const EMPTY_FORM = {
	testTypeId: "",
	testCategoryId: "",
	productType: "SATL",
	testProtocolId: "",
	referenceStd: "",
	numDays: 1,
	startDate: format(new Date(), "yyyy-MM-dd"),
	endDate: format(addDays(new Date(), 1), "yyyy-MM-dd"),
	remarks: "",
	stationIds: [] as string[],
};

export default function TestPlanningPage() {
	const [plans, setPlans] = useState<Plan[]>([]);
	const [master, setMaster] = useState<MasterData>({ types: [], categories: [], protocols: [], stations: [] });
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<Plan | null>(null);
	const [form, setForm] = useState({ ...EMPTY_FORM });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [pRes, tRes, cRes, prRes, sRes] = await Promise.all([
				fetch("/api/lab-manager/plans"),
				fetch("/api/master-data/test-types"),
				fetch("/api/master-data/test-categories"),
				fetch("/api/master-data/protocols"),
				fetch("/api/stations")
			]);
			if (pRes.ok) setPlans(await pRes.json());
			if (tRes.ok && cRes.ok && prRes.ok && sRes.ok) {
				setMaster({
					types: await tRes.json(),
					categories: await cRes.json(),
					protocols: await prRes.json(),
					stations: await sRes.json()
				});
			}
		} catch { /* silently fail */ }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { fetchData(); }, [fetchData]);

	// Platforms memo for station selection
	const platforms = useMemo(() => {
		const groups: Record<string, typeof master.stations> = {};
		master.stations.forEach(s => {
			if (!groups[s.platformId]) groups[s.platformId] = [];
			groups[s.platformId].push(s);
		});
		return Object.entries(groups).map(([id, stns]) => ({ 
			id, 
			stations: stns.sort((a, b) => {
				const aNum = parseInt(a.id.split("-S")[1] || "0");
				const bNum = parseInt(b.id.split("-S")[1] || "0");
				return aNum - bNum;
			}) 
		})).sort((a, b) => {
			const aNum = parseInt(a.id.replace("P", ""));
			const bNum = parseInt(b.id.replace("P", ""));
			return aNum - bNum;
		});
	}, [master.stations]);

	// Dependent Dropdowns
	const filteredCategories = useMemo(() => {
		if (!form.testTypeId) return [];
		return master.categories.filter(c => c.testTypeId === parseInt(form.testTypeId));
	}, [master.categories, form.testTypeId]);

	const isReliabilitySelected = useMemo(() => {
		const type = master.types.find(t => t.id === parseInt(form.testTypeId));
		return type?.name.toLowerCase().includes("reliability");
	}, [master.types, form.testTypeId]);

	const filteredProtocols = useMemo(() => {
		if (!form.testCategoryId) return [];
		return master.protocols.filter(p => {
			const catMatch = p.testCategoryId === parseInt(form.testCategoryId);
			if (isReliabilitySelected) {
				return catMatch && p.productType === form.productType;
			}
			return catMatch;
		});
	}, [master.protocols, form.testCategoryId, isReliabilitySelected, form.productType]);

	// Auto-calculate end date
	useEffect(() => {
		if (form.startDate && form.numDays) {
			const start = new Date(form.startDate);
			if (!isNaN(start.getTime())) {
				const end = addDays(start, parseInt(form.numDays.toString()) || 0);
				setForm(prev => ({ ...prev, endDate: format(end, "yyyy-MM-dd") }));
			}
		}
	}, [form.startDate, form.numDays]);

	const openAdd = () => {
		setEditTarget(null);
		setForm({ ...EMPTY_FORM });
		setError("");
		setShowModal(true);
	};

	const openEdit = (p: Plan) => {
		setEditTarget(p);
		setForm({
			testTypeId: p.testTypeId.toString(),
			testCategoryId: p.testCategoryId.toString(),
			productType: p.testProtocol.productType || "SATL",
			testProtocolId: p.testProtocolId.toString(),
			referenceStd: p.referenceStd || "",
			numDays: p.numDays,
			startDate: p.startDate.split("T")[0],
			endDate: p.endDate.split("T")[0],
			remarks: p.remarks || "",
			stationIds: p.stationIds ? p.stationIds.split(",") : [],
		});
		setError("");
		setShowModal(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.testTypeId || !form.testCategoryId || !form.testProtocolId) {
			setError("Test Type, Category, and Protocol are required.");
			return;
		}
		setSaving(true);
		try {
			const url = editTarget ? `/api/lab-manager/plans/${editTarget.id}` : "/api/lab-manager/plans";
			const method = editTarget ? "PUT" : "POST";
			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					stationIds: form.stationIds.join(","),
				}),
			});
			if (res.ok) {
				setSuccess(editTarget ? "Plan updated!" : "New test plan scheduled!");
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
			const res = await fetch(`/api/lab-manager/plans/${id}`, { method: "DELETE" });
			if (res.ok) {
				setSuccess("Plan deleted.");
				setDeleteConfirm(null);
				fetchData();
				setTimeout(() => setSuccess(""), 2500);
			}
		} catch { /* no-op */ }
	};

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="flex justify-between items-end mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Planning & Scheduling</h2>
					<p className="text-slate-500 mt-1 font-medium">Lab Manager's calendar and upcoming test queue.</p>
				</div>
				<button
					onClick={openAdd}
					className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Schedule New Test
				</button>
			</div>

			{success && (
				<div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 font-medium">
					{success}
				</div>
			)}

			{/* Plan List */}
			<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-widest font-black">
								<th className="px-6 py-4 border-b border-slate-200">Test Details</th>
								<th className="px-6 py-4 border-b border-slate-200">Timeline</th>
								<th className="px-6 py-4 border-b border-slate-200">Standard</th>
								<th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr><td colSpan={4} className="px-6 py-20 text-center animate-pulse">Loading plans...</td></tr>
							) : plans.length === 0 ? (
								<tr><td colSpan={4} className="px-6 py-20 text-center font-bold text-slate-400">No scheduled tests yet</td></tr>
							) : (
								plans.map((p) => (
									<tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
										<td className="px-6 py-4">
											<div className="flex flex-col">
												<span className="font-bold text-slate-900">{p.testProtocol.name}</span>
												<div className="flex items-center gap-2 mt-0.5">
													<span className="text-[10px] text-blue-600 font-black uppercase">
														{p.testType.name} • {p.testCategory.name}
													</span>
													{p.stationIds && (
														<div className="flex gap-1">
															{p.stationIds.split(",").map(sid => (
																<span key={sid} className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-black">
																	{sid}
																</span>
															))}
														</div>
													)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex flex-col">
												<div className="flex items-center gap-2 text-xs font-bold text-slate-700">
													<span>{format(new Date(p.startDate), "dd MMM")}</span>
													<span className="text-slate-300">→</span>
													<span>{format(new Date(p.endDate), "dd MMM")}</span>
												</div>
												<span className="text-[10px] text-slate-400 font-black mt-0.5">{p.numDays} DAYS DURATION</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
												{p.referenceStd || "N/A"}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-blue-100 transition-all">Edit</button>
												<button onClick={() => setDeleteConfirm(p.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-rose-100 transition-all">Delete</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add/Edit Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
							<h3 className="text-white font-bold">{editTarget ? "Edit Test Plan" : "Schedule New Test Plan"}</h3>
							<button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form onSubmit={handleSave} className="p-8 space-y-6">
							{error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}
							
							<div className="grid grid-cols-2 gap-6">
								<div>
									<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Test Type</label>
									<select
										value={form.testTypeId}
										onChange={(e) => setForm(f => ({ ...f, testTypeId: e.target.value, testCategoryId: "", testProtocolId: "" }))}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold"
									>
										<option value="">Select Type...</option>
										{master.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
									</select>
								</div>
								<div>
									<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Test Category</label>
									<select
										value={form.testCategoryId}
										onChange={(e) => setForm(f => ({ ...f, testCategoryId: e.target.value, testProtocolId: "" }))}
										disabled={!form.testTypeId}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold disabled:opacity-50"
									>
										<option value="">Select Category...</option>
										{filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
									</select>
								</div>
							</div>

							{isReliabilitySelected && (
								<>
									<div className="animate-in fade-in slide-in-from-top-2 duration-300">
										<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Product Type (for Reliability)</label>
										<div className="grid grid-cols-4 gap-3">
											{["SATL", "FATL", "FAFL", "WASH"].map((pt) => (
												<button
													key={pt}
													type="button"
													onClick={() => setForm(f => ({ ...f, productType: pt, testProtocolId: "" }))}
													className={`py-3 rounded-2xl text-[10px] font-black border-2 transition-all ${
														form.productType === pt
															? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
															: "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
													}`}
												>
													{pt}
												</button>
											))}
										</div>
									</div>

									<div className="animate-in fade-in slide-in-from-top-2 duration-300">
										<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign Stations (Platforms)</label>
										<div className="space-y-4 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-3xl border border-slate-100">
											{platforms.map(p => (
												<div key={p.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
													<p className="text-[9px] font-black text-slate-400 uppercase mb-3 px-1">{p.id}</p>
													<div className="grid grid-cols-5 gap-2">
														{p.stations.map(s => {
															const isSelected = form.stationIds.includes(s.id);
															return (
																<button
																	key={s.id}
																	type="button"
																	onClick={() => {
																		const newIds = isSelected 
																			? form.stationIds.filter(id => id !== s.id)
																			: [...form.stationIds, s.id];
																		setForm(f => ({ ...f, stationIds: newIds }));
																	}}
																	className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
																		isSelected 
																			? "bg-blue-600 border-blue-600 text-white" 
																			: "bg-slate-50 border-slate-100 text-slate-400"
																	}`}
																>
																	{s.id.split("-S")[1]}
																</button>
															);
														})}
													</div>
												</div>
											))}
										</div>
									</div>
								</>
							)}

							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Test Protocol</label>
								<select
									value={form.testProtocolId}
									onChange={(e) => setForm(f => ({ ...f, testProtocolId: e.target.value }))}
									disabled={!form.testCategoryId}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold disabled:opacity-50"
								>
									<option value="">Select Protocol...</option>
									{filteredProtocols.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
								</select>
							</div>

							<div className="grid grid-cols-2 gap-6">
								<div>
									<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reference Standard</label>
									<input
										type="text"
										value={form.referenceStd}
										onChange={(e) => setForm(f => ({ ...f, referenceStd: e.target.value }))}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold"
										placeholder="e.g. IEC 60335-2-7"
									/>
								</div>
								<div>
									<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Number of Days</label>
									<input
										type="number"
										value={form.numDays}
										onChange={(e) => setForm(f => ({ ...f, numDays: parseInt(e.target.value) || 0 }))}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-6">
								<div>
									<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
									<input
										type="date"
										value={form.startDate}
										onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold"
									/>
								</div>
								<div>
									<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Date (Auto-calculated)</label>
									<input
										type="date"
										value={form.endDate}
										readOnly
										className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold text-slate-400 cursor-not-allowed"
									/>
								</div>
							</div>

							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Remarks (Optional)</label>
								<textarea
									rows={3}
									value={form.remarks}
									onChange={(e) => setForm(f => ({ ...f, remarks: e.target.value }))}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium"
									placeholder="Any special instructions..."
								/>
							</div>

							<div className="flex gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm">Cancel</button>
								<button type="submit" disabled={saving} className="flex-[2] bg-slate-900 text-white font-bold py-3 rounded-2xl shadow-2xl shadow-slate-900/30 transition-all text-sm hover:bg-slate-800 disabled:bg-slate-400">
									{saving ? "Saving..." : (editTarget ? "Update Plan" : "Confirm Schedule")}
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
						<h3 className="text-xl font-bold text-slate-900 mb-6">Cancel this test plan?</h3>
						<div className="flex gap-3">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 text-sm">No, Keep it</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-rose-500/20">Yes, Cancel</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
