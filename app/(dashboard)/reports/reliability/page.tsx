"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ReliabilityTest = {
	id: number;
	modelCap: string;
	partName: string;
	vendor: string;
	clothLoad: string;
	startDate: string;
	status: string;
	dailyLogs: { id: number }[];
};

const STATUS_CONFIG = {
	ONGOING: { label: "Ongoing", cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500 animate-pulse" },
	COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
	FAILED: { label: "Failed", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

function formatDate(d: string) {
	return new Date(d).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export default function ReliabilityReports() {
	const router = useRouter();
	const [tests, setTests] = useState<ReliabilityTest[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");

	const fetchTests = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/reports/reliability");
			if (res.ok) setTests(await res.json());
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTests();
	}, [fetchTests]);

	const filtered = tests.filter((t) => {
		const matchSearch =
			t.partName.toLowerCase().includes(search.toLowerCase()) ||
			t.modelCap.toLowerCase().includes(search.toLowerCase()) ||
			t.vendor.toLowerCase().includes(search.toLowerCase());
		const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
		return matchSearch && matchStatus;
	});

	const ongoing = tests.filter((t) => t.status === "ONGOING").length;
	const completed = tests.filter((t) => t.status === "COMPLETED").length;
	const failed = tests.filter((t) => t.status === "FAILED").length;

	return (
		<div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Page Header */}
			<div className="flex justify-between items-end mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						Reliability Cycles
					</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Track and manage long-term reliability and durability tests.
					</p>
				</div>
				<Link
					href="/reports/reliability/new"
					className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Start New Cycle
				</Link>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-3 gap-4 mb-8">
				<div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
						<span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
					</div>
					<div>
						<p className="text-2xl font-extrabold text-slate-900">{ongoing}</p>
						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Ongoing</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<div>
						<p className="text-2xl font-extrabold text-slate-900">{completed}</p>
						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Completed</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</div>
					<div>
						<p className="text-2xl font-extrabold text-slate-900">{failed}</p>
						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Failed</p>
					</div>
				</div>
			</div>

			{/* Table Container */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
				{/* Search & Filter Bar */}
				<div className="p-5 border-b border-slate-100 flex flex-wrap gap-4 bg-slate-50/50 items-center">
					<div className="relative flex-1 min-w-[220px]">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
							placeholder="Search by part, model, vendor..."
						/>
					</div>
					<div className="flex gap-2">
						{["ALL", "ONGOING", "COMPLETED", "FAILED"].map((f) => (
							<button
								key={f}
								onClick={() => setStatusFilter(f)}
								className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${statusFilter === f
										? f === "ALL" ? "bg-slate-900 text-white border-slate-900"
											: f === "ONGOING" ? "bg-blue-600 text-white border-blue-600"
												: f === "COMPLETED" ? "bg-emerald-600 text-white border-emerald-600"
													: "bg-red-600 text-white border-red-600"
										: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
									}`}
							>
								{f}
							</button>
						))}
					</div>
				</div>

				{/* Data Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
								<th className="px-6 py-4 font-bold border-b border-slate-200">ID</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Part / Component</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Model</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Vendor</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Start Date</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Logs</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Status</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								[...Array(4)].map((_, i) => (
									<tr key={i}>
										{[...Array(8)].map((__, j) => (
											<td key={j} className="px-6 py-4">
												<div className="h-4 bg-slate-100 rounded animate-pulse" />
											</td>
										))}
									</tr>
								))
							) : filtered.length === 0 ? (
								<tr>
									<td colSpan={8} className="px-6 py-20 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
												<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
											</div>
											<p className="font-bold text-slate-500">No reliability cycles found</p>
											<p className="text-sm text-slate-400">
												{search || statusFilter !== "ALL" ? "Try different filters" : "Start your first reliability cycle"}
											</p>
										</div>
									</td>
								</tr>
							) : (
								filtered.map((test) => {
									const s = STATUS_CONFIG[test.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.ONGOING;
									return (
										<tr
											key={test.id}
											className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
											onClick={() => router.push(`/reports/reliability/${test.id}`)}
										>
											<td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">
												#{String(test.id).padStart(4, "0")}
											</td>
											<td className="px-6 py-4">
												<p className="text-sm font-bold text-slate-800">{test.partName}</p>
												<p className="text-xs text-slate-400 mt-0.5">{test.clothLoad}</p>
											</td>
											<td className="px-6 py-4 text-sm font-medium text-slate-600">{test.modelCap}</td>
											<td className="px-6 py-4 text-sm text-slate-600">{test.vendor}</td>
											<td className="px-6 py-4 text-sm text-slate-500">{formatDate(test.startDate)}</td>
											<td className="px-6 py-4">
												<span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
													{test.dailyLogs?.length ?? 0} days
												</span>
											</td>
											<td className="px-6 py-4">
												<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${s.cls}`}>
													<span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
													{s.label}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												<button className="text-blue-600 hover:text-blue-800 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
													View Details →
												</button>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
					<span>Showing {filtered.length} of {tests.length} cycles</span>
					<span className="text-xs text-slate-400">Click any row to view daily logs</span>
				</div>
			</div>
		</div>
	);
}
