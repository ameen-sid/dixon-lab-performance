"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function FilterConsole() {
	const router = useRouter();
	const searchParams = useSearchParams();
	
	const [from, setFrom] = useState(searchParams.get("from") || "");
	const [to, setTo] = useState(searchParams.get("to") || "");

	useEffect(() => {
		const params = new URLSearchParams();
		if (from) params.set("from", from);
		if (to) params.set("to", to);
		router.push(`/dashboard/requester?${params.toString()}`);
	}, [from, to, router]);

	return (
		<div className="bg-white rounded-[1rem] px-4 py-2.5 border border-slate-100 shadow-sm flex items-center gap-3">
			<input 
				type="date" 
				value={from}
				onChange={(e) => setFrom(e.target.value)}
				className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none w-36 focus:ring-2 focus:ring-blue-500/10 transition-all" 
			/>
			<div className="w-2 h-px bg-slate-200" />
			<input 
				type="date" 
				value={to}
				onChange={(e) => setTo(e.target.value)}
				className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none w-36 focus:ring-2 focus:ring-blue-500/10 transition-all" 
			/>
		</div>
	);
}
