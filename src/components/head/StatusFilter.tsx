"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StatusFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentStatus = searchParams.get("status") || "All";

	const statuses = ["All", "Pending", "Approved", "Rejected"];

	const handleStatusChange = (status: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (status === "All") {
			params.delete("status");
		} else {
			params.set("status", status);
		}
		params.set("page", "1"); // Reset to page 1 on filter
		router.push(`?${params.toString()}`);
	};

	return (
		<div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm gap-1">
			{statuses.map((status) => (
				<button
					key={status}
					onClick={() => handleStatusChange(status)}
					className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${currentStatus === status
							? "bg-slate-900 text-white shadow-sm"
							: "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
						}`}
				>
					{status}
				</button>
			))}
		</div>
	);
}
