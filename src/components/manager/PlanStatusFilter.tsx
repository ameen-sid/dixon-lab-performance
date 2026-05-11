"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PlanStatusFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentFilter = searchParams.get("filter") || "all";

	const filters = [
		{ label: "All Plans", value: "all" },
		{ label: "Planned", value: "PLANNED" },
		{ label: "Ongoing", value: "ONGOING" },
		{ label: "Pending Approval", value: "PENDING_APPROVAL" },
		{ label: "Approved", value: "APPROVED" },
		{ label: "Failed", value: "FAILED" },
	];

	const handleFilterChange = (val: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", "1"); // Reset to page 1 on filter change
		if (val === "all") {
			params.delete("filter");
		} else {
			params.set("filter", val);
		}
		router.push(`?${params.toString()}`);
	};

	return (
		<div className="flex bg-slate-100 p-1 rounded-2xl gap-1 w-fit shadow-inner">
			{filters.map((f) => (
				<button
					key={f.value}
					onClick={() => handleFilterChange(f.value)}
					className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentFilter === f.value
							? "bg-white text-slate-900 shadow-lg scale-100"
							: "text-slate-400 hover:text-slate-600 hover:bg-slate-50 scale-95"
						}`}
				>
					{f.label}
				</button>
			))}
		</div>
	);
}
