"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function InspectorDashboard() {
	const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0 });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchStats() {
			try {
				const res = await fetch("/api/inspector/tests");
				if (res.ok) {
					const data = await res.json();
					setStats({
						active: data.length,
						pending: 0, // Placeholder
						completed: 0 // Placeholder
					});
				}
			} catch { /* fail */ }
			finally { setLoading(false); }
		}
		fetchStats();
	}, []);

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="mb-10">
				<h2 className="text-4xl font-black text-slate-900 tracking-tight">Inspector Overview</h2>
				<p className="text-slate-500 mt-2 font-medium">Welcome back. Here is the status of your testing units.</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				<div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-blue-500 transition-all">
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Workload</p>
					<h3 className="text-4xl font-black text-slate-900">{loading ? "..." : stats.active}</h3>
					<p className="text-sm font-bold text-slate-500 mt-2">Active Life Tests</p>
				</div>
				<div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue</p>
					<h3 className="text-4xl font-black text-slate-900">0</h3>
					<p className="text-sm font-bold text-slate-500 mt-2">Scheduled Today</p>
				</div>
				<div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
					<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
					<h3 className="text-4xl font-black text-slate-900">0</h3>
					<p className="text-sm font-bold text-slate-500 mt-2">Logs Completed</p>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex justify-between items-center overflow-hidden relative shadow-2xl">
				<div className="relative z-10">
					<h3 className="text-3xl font-black mb-2 tracking-tight">Daily Checksheets</h3>
					<p className="text-slate-400 font-bold max-w-md">Access and fill the daily machine performance checksheets for all ongoing reliability tests.</p>
					<Link 
						href="/dashboard/inspector/tests"
						className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black mt-8 transition-all shadow-lg shadow-blue-500/30"
					>
						Open Test Queue
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</Link>
				</div>
				<div className="hidden lg:block opacity-20">
					<svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
					</svg>
				</div>
			</div>
		</div>
	);
}
