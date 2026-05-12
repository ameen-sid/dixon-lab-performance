"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function DateRangeFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
	const [toDate, setToDate] = useState(searchParams.get("toDate") || "");

	// Trigger filter automatically when dates change
	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		const currentFrom = searchParams.get("fromDate") || "";
		const currentTo = searchParams.get("toDate") || "";

		// Only push if values actually changed from URL to avoid infinite loops
		if (fromDate !== currentFrom || toDate !== currentTo) {
			if (fromDate) params.set("fromDate", fromDate);
			else params.delete("fromDate");
			
			if (toDate) params.set("toDate", toDate);
			else params.delete("toDate");
			
			params.set("page", "1"); // Reset to page 1 on filter
			router.push(`?${params.toString()}`);
		}
	}, [fromDate, toDate, router, searchParams]);

	const handleClear = () => {
		setFromDate("");
		setToDate("");
	};

	return (
		<div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
			<div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
				<span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">From</span>
				<input 
					type="date" 
					value={fromDate}
					onChange={(e) => setFromDate(e.target.value)}
					className="bg-transparent text-[10px] font-bold text-slate-900 outline-none w-[100px] cursor-pointer"
				/>
			</div>
			<div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
				<span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">To</span>
				<input 
					type="date" 
					value={toDate}
					onChange={(e) => setToDate(e.target.value)}
					className="bg-transparent text-[10px] font-bold text-slate-900 outline-none w-[100px] cursor-pointer"
				/>
			</div>
			{(fromDate || toDate) && (
				<button 
					onClick={handleClear}
					className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
					title="Clear Dates"
				>
					<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			)}
		</div>
	);
}
