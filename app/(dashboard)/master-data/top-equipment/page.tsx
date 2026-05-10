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
			case "AVAILABLE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
			case "OCCUPIED": return "bg-blue-100 text-blue-700 border-blue-200";
			case "MAINTENANCE": return "bg-amber-100 text-amber-700 border-amber-200";
			default: return "bg-slate-100 text-slate-700 border-slate-200";
		}
	};

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Top Equipment Management</h2>
					<p className="text-slate-500 mt-1 font-medium">Manage availability of key testing rigs and equipment.</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="relative">
						<input
							type="text"
							placeholder="Search equipment..."
							className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={openAdd}
						className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
					>
						Add Equipment
					</button>
				</div>
			</div>

			{success && (
				<div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 font-medium">
					{success}
				</div>
			)}

			<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
								<th className="px-8 py-5 border-b border-slate-200">Equipment Name</th>
								<th className="px-8 py-5 border-b border-slate-200">Current Status</th>
								<th className="px-8 py-5 border-b border-slate-200">Added On</th>
								<th className="px-8 py-5 border-b border-slate-200 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr><td colSpan={4} className="px-8 py-10 text-center animate-pulse">Loading...</td></tr>
							) : filteredEquipment.length === 0 ? (
								<tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-slate-400">No equipment found</td></tr>
							) : (
								filteredEquipment.map((item) => (
									<tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
										<td className="px-8 py-5">
											<span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</span>
										</td>
										<td className="px-8 py-5">
											<span className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-wider ${getStatusUI(item.status)}`}>
												{item.status}
											</span>
										</td>
										<td className="px-8 py-5 text-sm text-slate-500 font-medium">
											{new Date(item.createdAt).toLocaleDateString()}
										</td>
										<td className="px-8 py-5 text-right">
											<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-blue-100">
													Edit
												</button>
												<button onClick={() => setDeleteConfirm(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-rose-100">
													Delete
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
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
						<div className="flex justify-between items-center mb-8">
							<h3 className="text-2xl font-black text-slate-900">{editTarget ? "Edit Equipment" : "Add Top Equipment"}</h3>
							<button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form onSubmit={handleSave} className="space-y-6">
							{error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}
							
							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Equipment Name</label>
								<input
									type="text"
									value={form.name}
									onChange={(e) => setForm({ ...form, name: e.target.value })}
									className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
									placeholder="e.g. Rig-01 (Vertical Load)"
								/>
							</div>

							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Initial Status</label>
								<div className="grid grid-cols-3 gap-3">
									{["AVAILABLE", "OCCUPIED", "MAINTENANCE"].map((s) => (
										<button
											key={s}
											type="button"
											onClick={() => setForm({ ...form, status: s as any })}
											className={`py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${
												form.status === s
													? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20"
													: "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
											}`}
										>
											{s}
										</button>
									))}
								</div>
							</div>

							<div className="flex gap-3 pt-4">
								<button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm">Cancel</button>
								<button type="submit" disabled={saving} className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-2xl shadow-slate-900/30 transition-all text-sm hover:bg-slate-800 disabled:bg-slate-400">
									{saving ? "Saving..." : (editTarget ? "Update Record" : "Save Record")}
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
						<h3 className="text-xl font-bold text-slate-900 mb-6">Delete Equipment?</h3>
						<div className="flex gap-3">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 text-sm">Cancel</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-rose-500/20">Delete</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
