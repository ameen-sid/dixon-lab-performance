"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function StatusFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentStatus = searchParams.get("status") || "All";

	const statuses = ["All", "Pending", "Approved", "Rejected", "Completed"];

	const handleStatusChange = (status: string) => {
		const params = new URLSearchParams(searchParams.toString());
		if (status === "All") {
			params.delete("status");
		} else {
			params.set("status", status);
		}
		router.push(`?${params.toString()}`);
	};

	return (
		<div className="flex bg-slate-100 p-1 rounded-xl gap-1">
			{statuses.map((status) => (
				<button
					key={status}
					onClick={() => handleStatusChange(status)}
					className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
						currentStatus === status
							? "bg-white text-slate-900 shadow-sm"
							: "text-slate-500 hover:text-slate-700"
					}`}
				>
					{status}
				</button>
			))}
		</div>
	);
}
