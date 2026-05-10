"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type TestType = {
	id: number;
	name: string;
	createdAt: string;
};

export default function TestTypeManagement() {
	const [types, setTypes] = useState<TestType[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<TestType | null>(null);
	const [nameInput, setNameInput] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const fetchTypes = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/master-data/test-types");
			if (res.ok) setTypes(await res.json());
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTypes();
	}, [fetchTypes]);

	const filteredTypes = useMemo(() => {
		return types.filter(t => 
			t.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [types, searchQuery]);

	const openAdd = () => {
		setEditTarget(null);
		setNameInput("");
		setError("");
		setShowModal(true);
	};

	const openEdit = (t: TestType) => {
		setEditTarget(t);
		setNameInput(t.name);
		setError("");
		setShowModal(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!nameInput.trim()) { setError("Test Name is required."); return; }
		setSaving(true);
		setError("");
		try {
			const url = editTarget ? `/api/master-data/test-types/${editTarget.id}` : "/api/master-data/test-types";
			const method = editTarget ? "PUT" : "POST";
			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ 
					name: nameInput.trim()
				}),
			});
			if (res.ok) {
				setSuccess(editTarget ? "Test Type updated!" : "Test Type added!");
				setShowModal(false);
				fetchTypes();
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
			const res = await fetch(`/api/master-data/test-types/${id}`, { method: "DELETE" });
			if (res.ok) {
				setSuccess("Test Type deleted.");
				setDeleteConfirm(null);
				fetchTypes();
				setTimeout(() => setSuccess(""), 2500);
			}
		} catch {
			// no-op
		}
	};

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Type Management</h2>
					<p className="text-slate-500 mt-1 font-medium">Define and manage the specific types of reliability and functional tests.</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="relative">
						<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</span>
						<input
							type="text"
							placeholder="Search test types..."
							className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 shadow-sm"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={openAdd}
						className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Create Test Type
					</button>
				</div>
			</div>

			{success && (
				<div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 flex items-center gap-2 font-medium">
					<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					{success}
				</div>
			)}

			<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
								<th className="px-6 py-4 border-b border-slate-200">Full Name</th>
								<th className="px-6 py-4 border-b border-slate-200">Created On</th>
								<th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<tr key={i} className="animate-pulse">
										<td colSpan={3} className="px-6 py-8" />
									</tr>
								))
							) : filteredTypes.length === 0 ? (
								<tr>
									<td colSpan={3} className="px-6 py-20 text-center">
										<p className="text-slate-400 font-medium">No test types found</p>
									</td>
								</tr>
							) : (
								filteredTypes.map((t) => (
									<tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-6 py-4">
											<span className="font-semibold text-slate-900">{t.name}</span>
										</td>
										<td className="px-6 py-4 text-sm text-slate-500">
											{new Date(t.createdAt).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-2">
												<button onClick={() => openEdit(t)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button onClick={() => setDeleteConfirm(t.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
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

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
							<h3 className="text-white font-bold">{editTarget ? "Edit Test Type" : "Add Test Type"}</h3>
							<button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form onSubmit={handleSave} className="p-8 space-y-6">
							{error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">{error}</div>}
							<div>
								<label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Test Full Name</label>
								<input
									type="text"
									value={nameInput}
									onChange={(e) => setNameInput(e.target.value)}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold"
									placeholder="e.g. Temperature Rise Test"
								/>
							</div>
							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm">Cancel</button>
								<button type="submit" disabled={saving} className="bg-slate-900 text-white font-bold py-3 px-8 rounded-2xl shadow-xl shadow-slate-900/20 transition-all text-sm hover:bg-slate-800 disabled:bg-slate-400">
									{saving ? "Saving..." : "Save Test Type"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{deleteConfirm !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center">
						<div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4">
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<h3 className="text-xl font-bold text-slate-900 mb-2">Delete Test Type?</h3>
						<p className="text-slate-500 mb-6 font-medium">Are you sure? This action cannot be undone.</p>
						<div className="flex gap-3">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 text-sm transition-all">No, Cancel</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-lg shadow-rose-500/20">Yes, Delete</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
