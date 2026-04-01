"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLOTH_LOADS = ["BALANCED LOAD", "UNBALANCED LOAD", "FULL LOAD", "HALF LOAD", "EMPTY"];
const VENDORS = ["IN HOUSE", "Dixon Technologies", "External Vendor"];

export default function NewReliabilityCycle() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const [form, setForm] = useState({
		modelCap: "",
		partName: "",
		vendor: "",
		clothLoad: "",
		startDate: "",
	});

	const handleChange = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setError("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!form.modelCap || !form.partName || !form.vendor || !form.clothLoad || !form.startDate) {
			setError("Please fill in all required fields.");
			return;
		}

		setIsLoading(true);
		try {
			const res = await fetch("/api/reports/reliability", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					modelCap: form.modelCap,
					partName: form.partName,
					vendor: form.vendor,
					clothLoad: form.clothLoad,
					startDate: form.startDate,
				}),
			});

			if (res.ok) {
				const data = await res.json();
				setSuccess(true);
				setTimeout(() => router.push("/reports/reliability"), 1500);
			} else {
				const data = await res.json();
				setError(data.error || "Failed to start reliability test.");
			}
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Page Header */}
			<div className="mb-8">
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium text-sm mb-5 transition-colors group"
				>
					<svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
					</svg>
					Back to Reliability Cycles
				</button>
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
					Start New Reliability Cycle
				</h2>
				<p className="text-slate-500 mt-1 font-medium">
					Register a new long-running durability or endurance test.
				</p>
			</div>

			<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
				{/* Form Header */}
				<div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
					<h3 className="text-white font-semibold flex items-center gap-2">
						<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Cycle Configuration
					</h3>
					<span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/20">
						ONGOING
					</span>
				</div>

				<form onSubmit={handleSubmit} className="p-8 space-y-8">
					{error && (
						<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-center gap-2 font-medium">
							<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{error}
						</div>
					)}
					{success && (
						<div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 flex items-center gap-2 font-medium">
							<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Cycle started! Redirecting to overview...
						</div>
					)}

					{/* Row 1: Model & Part Name */}
					<div>
						<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Product Details</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
									Model / Capacity <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={form.modelCap}
									onChange={(e) => handleChange("modelCap", e.target.value)}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
									placeholder="e.g. T2, 8.5kg, P1-UI-1.5"
								/>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
									Part Name / Description <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									value={form.partName}
									onChange={(e) => handleChange("partName", e.target.value)}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
									placeholder="e.g. MODIFIED TUB AT CLASP AREA"
								/>
							</div>
						</div>
					</div>

					<hr className="border-slate-100" />

					{/* Row 2: Vendor & Cloth Load */}
					<div>
						<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Test Configuration</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
									Vendor / Source <span className="text-red-500">*</span>
								</label>
								<select
									value={form.vendor}
									onChange={(e) => handleChange("vendor", e.target.value)}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none"
								>
									<option value="">Select vendor...</option>
									{VENDORS.map((v) => (
										<option key={v} value={v}>{v}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
									Cloth Load Condition <span className="text-red-500">*</span>
								</label>
								<select
									value={form.clothLoad}
									onChange={(e) => handleChange("clothLoad", e.target.value)}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none"
								>
									<option value="">Select load type...</option>
									{CLOTH_LOADS.map((l) => (
										<option key={l} value={l}>{l}</option>
									))}
								</select>
							</div>
						</div>
					</div>

					<hr className="border-slate-100" />

					{/* Row 3: Start Date */}
					<div>
						<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Schedule</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
									Cycle Start Date <span className="text-red-500">*</span>
								</label>
								<input
									type="date"
									value={form.startDate}
									onChange={(e) => handleChange("startDate", e.target.value)}
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
								/>
							</div>
							<div className="flex items-end">
								<div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4">
									<p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Status After Creation</p>
									<div className="flex items-center gap-2">
										<span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
										<span className="text-sm font-semibold text-blue-800">ONGOING</span>
									</div>
									<p className="text-xs text-blue-600 mt-1">You can update daily logs from the cycle detail page.</p>
								</div>
							</div>
						</div>
					</div>

					{/* Submit */}
					<div className="pt-4 flex justify-end gap-3">
						<button
							type="button"
							onClick={() => router.back()}
							className="px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading || success}
							className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
						>
							{isLoading ? (
								<>
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									Starting...
								</>
							) : (
								<>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Start Cycle
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
