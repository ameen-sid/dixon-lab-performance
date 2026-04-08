"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type Department = {
	id: number;
	name: string;
	createdAt: string;
};

export default function DepartmentsPage() {
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<Department | null>(null);
	const [nameInput, setNameInput] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const fetchDepartments = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/master-data/departments");
			if (res.ok) setDepartments(await res.json());
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDepartments();
	}, [fetchDepartments]);

	const filteredDepartments = useMemo(() => {
		return departments.filter(d => 
			d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
			d.id.toString().includes(searchQuery)
		);
	}, [departments, searchQuery]);

	const openAdd = () => {
		setEditTarget(null);
		setNameInput("");
		setError("");
		setShowModal(true);
	};

	const openEdit = (d: Department) => {
		setEditTarget(d);
		setNameInput(d.name);
		setError("");
		setShowModal(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!nameInput.trim()) { setError("Department name is required."); return; }
		setSaving(true);
		setError("");
		try {
			const res = await fetch(
				editTarget ? `/api/master-data/departments/${editTarget.id}` : "/api/master-data/departments",
				{
					method: editTarget ? "PUT" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: nameInput.trim() }),
				},
			);
			if (res.ok) {
				setSuccess(editTarget ? "Department updated!" : "Department added!");
				setShowModal(false);
				fetchDepartments();
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
			const res = await fetch(`/api/master-data/departments/${id}`, { method: "DELETE" });
			if (res.ok) {
				setSuccess("Department deleted.");
				setDeleteConfirm(null);
				fetchDepartments();
				setTimeout(() => setSuccess(""), 2500);
			} else {
				const d = await res.json();
				setError(d.error || "Failed to delete.");
				setDeleteConfirm(null);
				setTimeout(() => setError(""), 3000);
			}
		} catch {
			// no-op
		}
	};

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header & Actions */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Department Management</h2>
					<p className="text-slate-500 mt-1 font-medium">Manage organizational units for staff assignment.</p>
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
							placeholder="Search..."
							className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-700 shadow-sm"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<button
						onClick={openAdd}
						className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Add Department
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

			{error && !showModal && (
				<div className="mb-6 bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm border border-rose-100 flex items-center gap-2 font-medium">
					<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
					{error}
				</div>
			)}

			{/* Table Layout */}
			<div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
								<th className="px-6 py-4 font-bold border-b border-slate-200 w-24">ID</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Department Name</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Created On</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<tr key={i} className="animate-pulse">
										<td colSpan={4} className="px-6 py-8" />
									</tr>
								))
							) : filteredDepartments.length === 0 ? (
								<tr>
									<td colSpan={4} className="px-6 py-20 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mx-auto">
												<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
												</svg>
											</div>
											<p className="font-bold text-slate-500">No departments found</p>
										</div>
									</td>
								</tr>
							) : (
								filteredDepartments.map((d) => (
									<tr key={d.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-6 py-4 font-mono text-sm text-slate-500">#{d.id.toString().padStart(3, '0')}</td>
										<td className="px-6 py-4">
											<span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
												{d.name}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-slate-500">
											{new Date(d.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() => openEdit(d)}
													className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
													title="Edit"
												>
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => setDeleteConfirm(d.id)}
													className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
													title="Delete"
												>
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

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center rounded-t-3xl sticky top-0 z-10">
							<h3 className="text-white font-bold flex items-center gap-2">
								<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
								</svg>
								{editTarget ? "Edit Department" : "Add New Department"}
							</h3>
							<button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form onSubmit={handleSave} className="p-8 space-y-6">
							{error && (
								<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">{error}</div>
							)}
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
									Department Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={nameInput}
									onChange={(e) => { setNameInput(e.target.value); setError(""); }}
									autoFocus
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
									placeholder="e.g. R&D, QUALITY, PRODUCTION"
								/>
							</div>
							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm">
									Cancel
								</button>
								<button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center gap-2">
									{saving ? "Saving..." : (editTarget ? "Update Department" : "Add Department")}
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
						<h3 className="text-lg font-bold text-slate-900 mb-2">Delete Department?</h3>
						<p className="text-sm text-slate-500 mb-6">This action cannot be undone. Departments with assigned users cannot be deleted.</p>
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
