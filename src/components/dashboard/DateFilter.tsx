"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function DateFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [startDate, setStartDate] = useState(searchParams.get("start") || "");
	const [endDate, setEndDate] = useState(searchParams.get("end") || "");

	const handleFilter = () => {
		const params = new URLSearchParams(searchParams.toString());
		if (startDate) params.set("start", startDate);
		else params.delete("start");

		if (endDate) params.set("end", endDate);
		else params.delete("end");

		router.push(`/dashboard?${params.toString()}`);
	};

	const clearFilter = () => {
		setStartDate("");
		setEndDate("");
		router.push("/dashboard");
	};

	return (
		<div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
			<div>
				<label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">From Date</label>
				<input
					type="date"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
				/>
			</div>
			<div>
				<label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">To Date</label>
				<input
					type="date"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
				/>
			</div>
			<div className="flex gap-2">
				<button
					onClick={handleFilter}
					className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95"
				>
					Apply Filter
				</button>
				{(startDate || endDate) && (
					<button
						onClick={clearFilter}
						className="text-slate-500 hover:text-red-500 px-3 py-2 text-sm font-semibold transition-colors"
					>
						Clear
					</button>
				)}
			</div>
		</div>
	);
}
