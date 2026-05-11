"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type TopEquipment = {
	id: number;
	name: string;
	status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
	createdAt: string;
};

const EMPTY_FORM = {
	name: "",
	status: "AVAILABLE" as const,
};

export default function TopEquipmentManagement() {
	const [equipment, setEquipment] = useState<TopEquipment[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<TopEquipment | null>(null);
	const [form, setForm] = useState({ ...EMPTY_FORM });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/master-data/top-equipment");
			if (res.ok) setEquipment(await res.json());
		} catch { /* fail */ }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { fetchData(); }, [fetchData]);

	const filteredEquipment = useMemo(() => {
		return equipment.filter(e =>
			e.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [equipment, searchQuery]);

	const openAdd = () => {
		setEditTarget(null);
		setForm({ ...EMPTY_FORM });
		setError("");
		setShowModal(true);
	};

	const openEdit = (item: TopEquipment) => {
		setEditTarget(item);
		setForm({
			name: item.name,
			status: item.status,
		});
		setError("");
		setShowModal(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) {
			setError("Equipment name is required.");
			return;
		}
		setSaving(true);
		setError("");
		try {
			const url = editTarget ? `/api/master-data/top-equipment/${editTarget.id}` : "/api/master-data/top-equipment";
			const method = editTarget ? "PUT" : "POST";
			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (res.ok) {
				setSuccess(editTarget ? "Equipment updated!" : "Equipment added!");
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
			const res = await fetch(`/api/master-data/top-equipment/${id}`, { method: "DELETE" });
			if (res.ok) {
				setSuccess("Equipment deleted.");
				setDeleteConfirm(null);
				fetchData();
				setTimeout(() => setSuccess(""), 2500);
			}
		} catch { /* no-op */ }
	};

	const getStatusUI = (status: string) => {
		switch (status) {
			case "AVAILABLE": return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-600/10";
			case "OCCUPIED": return "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-600/10";
			case "MAINTENANCE": return "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-600/10";
			default: return "bg-slate-50 text-slate-400 border-slate-100";
		}
	};

	return (
		<div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Breadcrumb / Header */}
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
					<span>Master Data</span>
					<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
					<span className="text-slate-900">Critical Infrastructure</span>
				</div>
				<button 
					onClick={openAdd}
					className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-2"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
					Register Rig
				</button>
			</div>

			<div className="dixon-card overflow-hidden border-slate-100/50 shadow-2xl shadow-slate-200/50">
				{/* Table Actions Header */}
				<div className="p-8 border-b border-slate-50 flex items-center justify-between gap-6 flex-wrap bg-slate-50/20">
					<div className="flex items-center gap-4">
						<h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Platform Allocation</h3>
						<span className="bg-white text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black border border-emerald-100 shadow-sm">{filteredEquipment.length} ACTIVE RIGS</span>
					</div>

					<div className="flex items-center gap-3 flex-1 justify-end max-w-md">
						<div className="relative flex-1">
							<svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
							<input 
								type="text" 
								placeholder="Search equipment names..." 
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all shadow-sm"
							/>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto no-scrollbar">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/30">
								<th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node ID</th>
								<th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Nomenclature</th>
								<th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Allocation Status</th>
								<th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Date</th>
								<th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100/50">
							{loading ? (
								<tr><td colSpan={5} className="px-8 py-24 text-center animate-pulse text-[11px] font-black text-slate-300 uppercase tracking-widest">Platform handshake...</td></tr>
							) : filteredEquipment.length === 0 ? (
								<tr><td colSpan={5} className="px-8 py-24 text-center text-[11px] font-black text-slate-300 uppercase tracking-widest italic">No platforms initialized</td></tr>
							) : (
								filteredEquipment.map((item) => (
									<tr key={item.id} className="group hover:bg-slate-50/30 transition-all">
										<td className="px-8 py-6">
											<span className="text-[11px] font-black text-slate-300 font-mono tracking-widest">#{item.id.toString().padStart(4, '0')}</span>
										</td>
										<td className="px-8 py-6">
											<div className="flex items-center gap-4">
												<div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-[11px] font-black text-white shadow-xl shadow-slate-900/10">
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
												</div>
												<span className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
											</div>
										</td>
										<td className="px-8 py-6">
											<span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusUI(item.status)}`}>
												<div className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${item.status === 'AVAILABLE' ? 'bg-emerald-500' : item.status === 'OCCUPIED' ? 'bg-blue-500' : 'bg-rose-500'}`} />
												{item.status}
											</span>
										</td>
										<td className="px-8 py-6">
											<div className="flex flex-col">
												<span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">
													{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
												</span>
												<span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Asset Logged</span>
											</div>
										</td>
										<td className="px-8 py-6 text-right">
											<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
												<button
													onClick={() => openEdit(item)}
													className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl border border-transparent hover:border-emerald-100 shadow-sm transition-all"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
												</button>
												<button
													onClick={() => { setDeleteConfirm(item.id); }}
													className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl border border-transparent hover:border-rose-100 shadow-sm transition-all"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
					<div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white">
						<div className="bg-slate-900 px-10 py-8 flex justify-between items-center shrink-0">
							<div>
								<p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Hardware Abstraction</p>
								<h3 className="text-2xl font-black text-white mt-1 tracking-tight">{editTarget ? "Modify Rig" : "Initialize Platform"}</h3>
							</div>
							<button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center rounded-2xl transition-all">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>
						<form onSubmit={handleSave} className="p-10 space-y-8 bg-slate-50/30">
							{error && <div className="bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">{error}</div>}
							
							<div className="space-y-2">
								<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Nomenclature</label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									autoFocus
									className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-black shadow-sm"
									placeholder="e.g. Endurance Rig Alpha"
								/>
							</div>

							<div className="space-y-3">
								<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational State</label>
								<div className="grid grid-cols-3 gap-3">
									{["AVAILABLE", "OCCUPIED", "MAINTENANCE"].map((s) => (
										<button
											key={s}
											type="button"
											onClick={() => setForm({ ...form, status: s as any })}
											className={`py-4 rounded-2xl text-[10px] font-black transition-all border-2 shadow-sm ${
												form.status === s
													? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/30"
													: "bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-600"
											}`}
										>
											{s}
										</button>
									))}
								</div>
							</div>

							<div className="flex gap-4 pt-6 border-t border-slate-100">
								<button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 transition-all text-[11px] uppercase tracking-widest">Discard</button>
								<button type="submit" disabled={saving} className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl shadow-2xl shadow-slate-900/30 transition-all text-[11px] uppercase tracking-[0.25em] hover:bg-black active:scale-95">
									{saving ? "Storing..." : (editTarget ? "Update Hardware" : "Confirm Platform")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirm */}
			{deleteConfirm !== null && (
				<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
					<div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm p-10 text-center animate-in zoom-in-95 duration-200 border border-white">
						<div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
						</div>
						<h3 className="text-xl font-black text-slate-900 mb-2">Purge Hardware?</h3>
						<p className="text-slate-400 text-[10px] font-bold leading-relaxed mb-8 uppercase tracking-widest">This platform will be decommissioned. Active cycles may be orphaned.</p>
						<div className="flex gap-4">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 text-[10px] uppercase tracking-widest transition-all">Go Back</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-all">Confirm</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
