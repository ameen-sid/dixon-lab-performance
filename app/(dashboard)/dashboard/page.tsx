import prisma from "@/src/lib/prisma";
import Link from "next/link";
import DateFilter from "@/src/components/dashboard/DateFilter";
import { Suspense } from "react";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";

async function getDashboardStats(startDate?: string, endDate?: string) {
	try {
		const where: any = {};
		if (startDate || endDate) {
			where.createdAt = {};
			if (startDate) where.createdAt.gte = new Date(startDate);
			if (endDate) {
				const end = new Date(endDate);
				end.setHours(23, 59, 59, 999);
				where.createdAt.lte = end;
			}
		}

		const [
			totalFunctional,
			passedFunctional,
			failedFunctional,
			totalReliability,
			ongoingReliability,
			completedReliability,
			totalDailyLogs
		] = await Promise.all([
			prisma.functionalTest.count({ where }),
			prisma.functionalTest.count({ where: { ...where, isPass: true } }),
			prisma.functionalTest.count({ where: { ...where, isPass: false } }),
			prisma.reliabilityTest.count({ where }),
			prisma.reliabilityTest.count({ where: { ...where, status: "ONGOING" } }),
			prisma.reliabilityTest.count({ where: { ...where, status: "COMPLETED" } }),
			prisma.dailyLog.count({ where }),
		]);

		const passRate = totalFunctional > 0 ? Math.round((passedFunctional / totalFunctional) * 100) : 0;

		// Recent functional tests
		const recentTests = await prisma.functionalTest.findMany({
			where,
			take: 5,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				productPartName: true,
				testName: true,
				isPass: true,
				createdAt: true,
				companySupplier: true,
			},
		});

		return {
			totalFunctional,
			passedFunctional,
			failedFunctional,
			totalReliability,
			ongoingReliability,
			completedReliability,
			totalDailyLogs,
			passRate,
			recentTests
		};
	} catch (e) {
		console.error("Dashboard error:", e);
		return {
			totalFunctional: 0,
			passedFunctional: 0,
			failedFunctional: 0,
			totalReliability: 0,
			ongoingReliability: 0,
			completedReliability: 0,
			totalDailyLogs: 0,
			passRate: 0,
			recentTests: []
		};
	}
}

function formatDate(d: Date) {
	return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function DashboardOverview({ searchParams }: { searchParams: Promise<{ start?: string; end?: string }> }) {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	if (user.role === "Requester") {
		redirect("/dashboard/requester");
	}

	if (user.role === "Head") {
		redirect("/dashboard/head");
	}

	if (user.role === "Lab Manager") {
		redirect("/dashboard/manager");
	}

	if (user.role === "Engineer") {
		redirect("/dashboard/engineer");
	}

	const { start, end } = await searchParams;
	const stats = await getDashboardStats(start, end);

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			{/* Page Title */}
			<div className="mb-6 flex justify-between items-start">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						Welcome back, Admin
					</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Here&apos;s what is happening in the lab today.
					</p>
				</div>
				<Link
					href="/reports/functional/new"
					className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 transform active:scale-95"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					New Report
				</Link>
			</div>

			{/* Date Selection */}
			<Suspense fallback={<div className="h-20 bg-slate-50 rounded-2xl animate-pulse mb-8" />}>
				<DateFilter />
			</Suspense>

			{/* ─── Functional Test Overview ─── */}
			<div className="mb-6">
				<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
					Test Overview
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
					{/* Total Functional */}
					<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
						<div className="absolute top-0 right-0 w-28 h-28 bg-slate-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
						<div className="relative z-10">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Total Tests</h3>
									<p className="text-3xl font-extrabold text-slate-900">{stats.totalFunctional}</p>
								</div>
								<div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-xs">
								<span className="text-slate-400 font-medium italic">inspection reports</span>
							</div>
						</div>
					</div>

					{/* Passed Functional */}
					<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
						<div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
						<div className="relative z-10">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Passed Tests</h3>
									<p className="text-3xl font-extrabold text-slate-900">{stats.passedFunctional}</p>
								</div>
								<div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
									</svg>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-xs">
								<span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">{stats.passRate}% pass rate</span>
							</div>
						</div>
					</div>

					{/* Failed Functional */}
					<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
						<div className="absolute top-0 right-0 w-28 h-28 bg-red-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
						<div className="relative z-10">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Failed Tests</h3>
									<p className="text-3xl font-extrabold text-slate-900">{stats.failedFunctional}</p>
								</div>
								<div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-xs">
								<span className={`font-bold px-2 py-1 rounded-md ${stats.failedFunctional > 0 ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-50"}`}>
									{stats.failedFunctional > 0 ? "Needs Review" : "All Clear"}
								</span>
							</div>
						</div>
					</div>

					{/* Pass Rate Metric */}
					<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
						<div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
						<div className="relative z-10">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Success Rating</h3>
									<p className="text-3xl font-extrabold text-slate-900">{stats.passRate}%</p>
								</div>
								<div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
									</svg>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-xs">
								<div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
									<div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.passRate}%` }} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* ─── Reliability Test Overview ─── */}
			<div className="mb-10">
				<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
					<span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
					Reliability Cycle Overview
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
					{/* Total Reliability */}
					<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
						<div className="absolute top-0 right-0 w-28 h-28 bg-slate-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
						<div className="relative z-10">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Total Cycles</h3>
									<p className="text-3xl font-extrabold text-slate-900">{stats.totalReliability}</p>
								</div>
								<div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-xs">
								<span className="text-slate-400 font-medium italic">total testing cycles</span>
							</div>
						</div>
					</div>

					{/* Ongoing Reliability */}
					<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
						<div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
						<div className="relative z-10">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Active Cycles</h3>
									<p className="text-3xl font-extrabold text-slate-900">{stats.ongoingReliability}</p>
								</div>
								<div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-xs">
								<span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1">
									<span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
									In Progress
								</span>
							</div>
						</div>
					</div>

					{/* Completed Reliability */}
					<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
						<div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
						<div className="relative z-10">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Completed</h3>
									<p className="text-3xl font-extrabold text-slate-900">{stats.completedReliability}</p>
								</div>
								<div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
									</svg>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-xs">
								<span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">Cycle Finished</span>
							</div>
						</div>
					</div>

					{/* Total Logs */}
					<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
						<div className="absolute top-0 right-0 w-28 h-28 bg-violet-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
						<div className="relative z-10">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider mb-1">Total Effort</h3>
									<p className="text-3xl font-extrabold text-slate-900">{stats.totalDailyLogs}</p>
								</div>
								<div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</div>
							</div>
							<div className="mt-4 flex items-center gap-2 text-xs">
								<span className="text-slate-400 font-medium italic">daily logs recorded</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Section: Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Recent Functional Tests Table */}
				<div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
					<div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
						<h3 className="font-bold text-slate-900">Recent Tests</h3>
						<Link href="/reports/functional" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
							View All →
						</Link>
					</div>
					<div className="divide-y divide-slate-100">
						{stats.recentTests.length === 0 ? (
							<div className="p-12 text-center text-slate-400">
								<p className="font-semibold">No tests yet</p>
								<p className="text-sm mt-1">Submit your first test report.</p>
							</div>
						) : (
							stats.recentTests.map((test) => (
								<div key={test.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors group">
									<div className="flex items-center gap-3">
										<div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${test.isPass ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
											{test.isPass ? (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
												</svg>
											) : (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
												</svg>
											)}
										</div>
										<div>
											<p className="text-sm font-bold text-slate-800">{test.productPartName}</p>
											<p className="text-xs text-slate-400">{test.testName} · {test.companySupplier}</p>
										</div>
									</div>
									<div className="text-right">
										<span className={`text-xs font-bold px-2 py-1 rounded-lg ${test.isPass ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
											{test.isPass ? "PASS" : "FAIL"}
										</span>
										<p className="text-xs text-slate-400 mt-1">{formatDate(test.createdAt)}</p>
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* Quick Actions Panel */}
				<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
					<div className="p-6 border-b border-slate-100 bg-slate-50/50">
						<h3 className="font-bold text-slate-900">Quick Actions</h3>
					</div>
					<div className="p-5 space-y-3">
						<Link href="/reports/functional/new" className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
							<div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
								</svg>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-800">New Test</p>
								<p className="text-xs text-slate-400">Log a inspection</p>
							</div>
						</Link>
						<Link href="/reports/reliability/new" className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group">
							<div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors flex-shrink-0">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-800">Start Reliability Cycle</p>
								<p className="text-xs text-slate-400">Begin a durability test</p>
							</div>
						</Link>
						<Link href="/master-data/protocols" className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all group">
							<div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors flex-shrink-0">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-800">Manage Protocols</p>
								<p className="text-xs text-slate-400">Add test criteria</p>
							</div>
						</Link>
						<Link href="/master-data/suppliers" className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
							<div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors flex-shrink-0">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
								</svg>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-800">Manage Suppliers</p>
								<p className="text-xs text-slate-400">Update vendor list</p>
							</div>
						</Link>
						<Link href="/master-data/users" className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
							<div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors flex-shrink-0">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<div>
								<p className="text-sm font-bold text-slate-800">User Management</p>
								<p className="text-xs text-slate-400">Add / remove users</p>
							</div>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
