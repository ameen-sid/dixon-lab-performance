"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type Product = {
	id: number;
	name: string;
	partNo: string | null;
	createdAt: string;
};

export default function ProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<Product | null>(null);
	const [nameInput, setNameInput] = useState("");
	const [partNoInput, setPartNoInput] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/master-data/products");
			if (res.ok) setProducts(await res.json());
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	const filteredProducts = useMemo(() => {
		return products.filter(p =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(p.partNo && p.partNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
			p.id.toString().includes(searchQuery)
		);
	}, [products, searchQuery]);

	const openAdd = () => {
		setEditTarget(null);
		setNameInput("");
		setPartNoInput("");
		setError("");
		setShowModal(true);
	};

	const openEdit = (p: Product) => {
		setEditTarget(p);
		setNameInput(p.name);
		setPartNoInput(p.partNo || "");
		setError("");
		setShowModal(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!nameInput.trim()) { setError("Name is required."); return; }
		setSaving(true);
		setError("");
		try {
			const res = await fetch(
				editTarget ? `/api/master-data/products/${editTarget.id}` : "/api/master-data/products",
				{
					method: editTarget ? "PUT" : "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: nameInput.trim(),
						partNo: partNoInput.trim() || null
					}),
				},
			);
			if (res.ok) {
				setSuccess(editTarget ? "Product updated!" : "Product added!");
				setShowModal(false);
				fetchProducts();
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
			const res = await fetch(`/api/master-data/products/${id}`, { method: "DELETE" });
			if (res.ok) {
				setSuccess("Product deleted.");
				setDeleteConfirm(null);
				fetchProducts();
				setTimeout(() => setSuccess(""), 2500);
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
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product / Part Names</h2>
					<p className="text-slate-500 mt-1 font-medium">Manage the master list of production units and components.</p>
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
						className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Add Product
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

			{/* Table Layout */}
			<div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
								<th className="px-6 py-4 font-bold border-b border-slate-200 w-24">ID</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Part Number</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Product / Part Name</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Date Added</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<tr key={i} className="animate-pulse">
										<td colSpan={5} className="px-6 py-8" />
									</tr>
								))
							) : filteredProducts.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-6 py-20 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 mx-auto">
												<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
												</svg>
											</div>
											<p className="font-bold text-slate-500">No products found</p>
										</div>
									</td>
								</tr>
							) : (
								filteredProducts.map((p) => (
									<tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-6 py-4 font-mono text-sm text-slate-500">#{p.id.toString().padStart(3, '0')}</td>
										<td className="px-6 py-4">
											<span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
												{p.partNo || "—"}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
												{p.name}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-slate-500">
											{new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<button
													onClick={() => openEdit(p)}
													className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
													title="Edit"
												>
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => setDeleteConfirm(p.id)}
													className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
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
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center rounded-t-3xl sticky top-0 z-10">
							<h3 className="text-white font-bold flex items-center gap-2">
								<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
								</svg>
								{editTarget ? "Edit Product" : "Add New Product"}
							</h3>
							<button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<form onSubmit={handleSave} className="p-8 space-y-6">
							{error && (
								<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium">{error}</div>
							)}
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
										Part Number
									</label>
									<input
										type="text"
										value={partNoInput}
										onChange={(e) => setPartNoInput(e.target.value)}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
										placeholder="e.g. TUB-001-REV-A"
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
										Product / Part Name <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={nameInput}
										onChange={(e) => { setNameInput(e.target.value); setError(""); }}
										autoFocus
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
										placeholder="e.g. TUB ASSEMBLY, CLAMP"
									/>
								</div>
							</div>
							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm cursor-pointer">
									Cancel
								</button>
								<button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center gap-2 cursor-pointer">
									{saving ? "Saving..." : (editTarget ? "Update Product" : "Add Product")}
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
						<h3 className="text-lg font-bold text-slate-900 mb-2">Delete Record?</h3>
						<p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
						<div className="flex gap-3">
							<button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 text-sm cursor-pointer">Cancel</button>
							<button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm cursor-pointer">Delete</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
