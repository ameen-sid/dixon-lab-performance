"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type FunctionalTest = {
	id: number;
	productPartName: string;
	companySupplier: string;
	productType: string;
	testName: string;
	isPass: boolean;
	testStartDate: string;
	testEndDate: string;
	createdAt: string;
};

const STATUS_BADGE = {
	pass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
	fail: "bg-red-50 text-red-700 border border-red-200",
};

const TYPE_BADGE =
	"bg-blue-50 text-blue-700 border border-blue-200";

function formatDate(d: string) {
	return new Date(d).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export default function FunctionalTestHistory() {
	const [tests, setTests] = useState<FunctionalTest[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"ALL" | "PASS" | "FAIL">("ALL");
	const [page, setPage] = useState(1);
	const PER_PAGE = 8;

	const fetchTests = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/reports/functional");
			if (res.ok) {
				const data = await res.json();
				setTests(data);
			}
		} catch {
			// silently fail – demo mode
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTests();
	}, [fetchTests]);

	const filtered = tests.filter((t) => {
		const matchesSearch =
			t.productPartName.toLowerCase().includes(search.toLowerCase()) ||
			t.companySupplier.toLowerCase().includes(search.toLowerCase()) ||
			t.testName.toLowerCase().includes(search.toLowerCase());
		const matchesStatus =
			statusFilter === "ALL"
				? true
				: statusFilter === "PASS"
				? t.isPass
				: !t.isPass;
		return matchesSearch && matchesStatus;
	});

	const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
	const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	// Reset to first page on filter/search change
	const handleSearch = (v: string) => {
		setSearch(v);
		setPage(1);
	};
	const handleStatusFilter = (v: "ALL" | "PASS" | "FAIL") => {
		setStatusFilter(v);
		setPage(1);
	};

	// Summary stats
	const totalPass = tests.filter((t) => t.isPass).length;
	const totalFail = tests.filter((t) => !t.isPass).length;
	const passRate =
		tests.length > 0 ? Math.round((totalPass / tests.length) * 100) : 0;

	return (
		<div className="max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Page Header */}
			<div className="flex justify-between items-end mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						Functional Test History
					</h2>
					<p className="text-slate-500 mt-1 font-medium">
						All QA inspection reports logged in the system.
					</p>
				</div>
				<Link
					href="/reports/functional/new"
					className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					New Report
				</Link>
			</div>

			{/* Summary Mini-Cards */}
			<div className="grid grid-cols-3 gap-4 mb-8">
				<div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
					</div>
					<div>
						<p className="text-2xl font-extrabold text-slate-900">{tests.length}</p>
						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Reports</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div>
						<p className="text-2xl font-extrabold text-slate-900">{totalPass}</p>
						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Passed</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex items-center gap-4">
					<div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<div>
						<p className="text-2xl font-extrabold text-slate-900">{totalFail}</p>
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
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
							placeholder="Search by part name, supplier, test..."
						/>
					</div>
					<div className="flex gap-2">
						{(["ALL", "PASS", "FAIL"] as const).map((f) => (
							<button
								key={f}
								onClick={() => handleStatusFilter(f)}
								className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
									statusFilter === f
										? f === "ALL"
											? "bg-slate-900 text-white border-slate-900"
											: f === "PASS"
											? "bg-emerald-600 text-white border-emerald-600"
											: "bg-red-600 text-white border-red-600"
										: "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
								}`}
							>
								{f}
							</button>
						))}
					</div>
					<span className="ml-auto text-xs font-semibold text-slate-400 hidden sm:block">
						Pass Rate: <span className="text-slate-700">{passRate}%</span>
					</span>
				</div>

				{/* Table */}
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
								<th className="px-6 py-4 font-bold border-b border-slate-200">#</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Part Name</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Supplier</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Type</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Test</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Date</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Result</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								[...Array(5)].map((_, i) => (
									<tr key={i}>
										{[...Array(8)].map((__, j) => (
											<td key={j} className="px-6 py-4">
												<div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
											</td>
										))}
									</tr>
								))
							) : paginated.length === 0 ? (
								<tr>
									<td colSpan={8} className="px-6 py-20 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
												<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
											</div>
											<p className="font-bold text-slate-500">No reports found</p>
											<p className="text-sm text-slate-400">
												{search || statusFilter !== "ALL" ? "Try changing filters" : "Start by submitting a new functional test report"}
											</p>
										</div>
									</td>
								</tr>
							) : (
								paginated.map((test, idx) => (
									<tr key={test.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-6 py-4 text-xs font-mono text-slate-400">
											{(page - 1) * PER_PAGE + idx + 1}
										</td>
										<td className="px-6 py-4">
											<p className="text-sm font-bold text-slate-800">{test.productPartName}</p>
										</td>
										<td className="px-6 py-4 text-sm text-slate-600">{test.companySupplier}</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_BADGE}`}>
												{test.productType}
											</span>
										</td>
										<td className="px-6 py-4 text-sm font-semibold text-slate-600">{test.testName}</td>
										<td className="px-6 py-4 text-sm text-slate-500">{formatDate(test.testStartDate)}</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${test.isPass ? STATUS_BADGE.pass : STATUS_BADGE.fail}`}>
												<span className={`w-1.5 h-1.5 rounded-full ${test.isPass ? "bg-emerald-500" : "bg-red-500"}`} />
												{test.isPass ? "PASS" : "FAIL"}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<Link href={`/reports/functional/${test.id}`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
												View →
											</Link>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
					<span>
						Showing {Math.min(filtered.length, (page - 1) * PER_PAGE + 1)}–{Math.min(filtered.length, page * PER_PAGE)} of {filtered.length} results
					</span>
					<div className="flex gap-2">
						<button
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page === 1}
							className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all font-medium"
						>
							Prev
						</button>
						{[...Array(totalPages)].map((_, i) => (
							<button
								key={i}
								onClick={() => setPage(i + 1)}
								className={`px-3 py-1.5 border rounded-lg transition-all font-medium ${
									page === i + 1
										? "bg-slate-900 text-white border-slate-900"
										: "border-slate-200 hover:bg-slate-50"
								}`}
							>
								{i + 1}
							</button>
						))}
						<button
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
							className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-all font-medium"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
