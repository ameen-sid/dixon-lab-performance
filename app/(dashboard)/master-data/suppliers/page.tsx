"use client";

import { useState, useEffect, useCallback } from "react";

type Supplier = {
	id: number;
	name: string;
	createdAt: string;
};

export default function SuppliersPage() {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<Supplier | null>(null);
	const [nameInput, setNameInput] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

	const fetchSuppliers = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/master-data/suppliers");
			if (res.ok) setSuppliers(await res.json());
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSuppliers();
	}, [fetchSuppliers]);

	const openAdd = () => {
		setEditTarget(null);
		setNameInput("");
		setError("");
		setShowModal(true);
	};

	const openEdit = (s: Supplier) => {
		setEditTarget(s);
		setNameInput(s.name);
		setError("");
		setShowModal(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!nameInput.trim()) { setError("Supplier name is required."); return; }
		setSaving(true);
		setError("");
		try {
			const res = await fetch(
				editTarget ? `/api/master-data/suppliers/${editTarget.id}` : "/api/master-data/suppliers",
				{
					method: editTarget ? "PUT" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: nameInput.trim() }),
				},
			);
			if (res.ok) {
				setSuccess(editTarget ? "Supplier updated!" : "Supplier added!");
				setShowModal(false);
				fetchSuppliers();
				setTimeout(() => setSuccess(""), 2500);
			} else {
				const d = await res.json();
				setError(d.error || "Failed to save.");
			}
		} catch {
			setError("Network error.");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			const res = await fetch(`/api/master-data/suppliers/${id}`, { method: "DELETE" });
			if (res.ok) {
				setSuccess("Supplier deleted.");
				setDeleteConfirm(null);
				fetchSuppliers();
				setTimeout(() => setSuccess(""), 2500);
			}
		} catch {
			// no-op
		}
	};

	const INITIALS_BG = [
		"bg-blue-100 text-blue-700",
		"bg-indigo-100 text-indigo-700",
		"bg-violet-100 text-violet-700",
		"bg-emerald-100 text-emerald-700",
		"bg-amber-100 text-amber-700",
		"bg-rose-100 text-rose-700",
	];

	return (
		<div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="flex justify-between items-end mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Suppliers</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Manage the master list of component suppliers and vendors.
					</p>
				</div>
				<button
					onClick={openAdd}
					className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Add Supplier
				</button>
			</div>

			{success && (
				<div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 flex items-center gap-2 font-medium">
					<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					{success}
				</div>
			)}

			{/* Suppliers Grid */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse h-20" />
					))}
				</div>
			) : suppliers.length === 0 ? (
				<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-16 text-center">
					<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mx-auto mb-4">
						<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
					</div>
					<p className="font-bold text-slate-500">No suppliers yet</p>
					<p className="text-sm text-slate-400 mt-1">Add your first supplier to populate the dropdown in functional tests.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{suppliers.map((s, idx) => (
						<div
							key={s.id}
							className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:border-blue-200 hover:shadow-md transition-all group flex items-center justify-between"
						>
							<div className="flex items-center gap-4">
								<div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${INITIALS_BG[idx % INITIALS_BG.length]}`}>
									{s.name.charAt(0).toUpperCase()}
								</div>
								<div>
									<p className="font-bold text-slate-900 text-base">{s.name}</p>
									<p className="text-xs text-slate-400 mt-0.5">
										Added {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									onClick={() => openEdit(s)}
									className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
									title="Edit"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</button>
								<button
									onClick={() => setDeleteConfirm(s.id)}
									className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
									title="Delete"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Add / Edit Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center rounded-t-3xl">
							<h3 className="text-white font-bold">
								{editTarget ? "Edit Supplier" : "Add New Supplier"}
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
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
									Supplier Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={nameInput}
									onChange={(e) => { setNameInput(e.target.value); setError(""); }}
									autoFocus
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
									placeholder="e.g. IN HOUSE, Dixon Technologies"
								/>
							</div>
							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm">
									Cancel
								</button>
								<button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center gap-2">
									{saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : (editTarget ? "Update" : "Add Supplier")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirm Dialog */}
			{deleteConfirm !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
						<div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-5">
							<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<h3 className="text-lg font-bold text-slate-900 mb-2">Delete Supplier?</h3>
						<p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
						<div className="flex gap-3">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm">
								Cancel
							</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm">
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
