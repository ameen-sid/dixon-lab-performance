import prisma from "@/src/lib/prisma";
import Link from "next/link";

async function getDashboardStats() {
	try {
		const [totalFunctional, passedFunctional, failedFunctional, ongoingReliability, completedReliability] = await Promise.all([
			prisma.functionalTest.count(),
			prisma.functionalTest.count({ where: { isPass: true } }),
			prisma.functionalTest.count({ where: { isPass: false } }),
			prisma.reliabilityTest.count({ where: { status: "ONGOING" } }),
			prisma.reliabilityTest.count({ where: { status: "COMPLETED" } }),
		]);

		const passRate = totalFunctional > 0 ? Math.round((passedFunctional / totalFunctional) * 100) : 0;

		// Recent functional tests
		const recentTests = await prisma.functionalTest.findMany({
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

		return { totalFunctional, passedFunctional, failedFunctional, ongoingReliability, completedReliability, passRate, recentTests };
	} catch {
		return { totalFunctional: 0, passedFunctional: 0, failedFunctional: 0, ongoingReliability: 0, completedReliability: 0, passRate: 0, recentTests: [] };
	}
}

function formatDate(d: Date) {
	return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function DashboardOverview() {
	const stats = await getDashboardStats();

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			{/* Page Title */}
			<div className="mb-8 flex justify-between items-end">
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
					className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					New Report
				</Link>
			</div>

			{/* Metric Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
				{/* Card 1: Total Tests */}
				<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
					<div className="absolute top-0 right-0 w-28 h-28 bg-slate-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
					<div className="relative z-10">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="text-slate-500 font-semibold text-sm mb-1">Total Functional Tests</h3>
								<p className="text-4xl font-extrabold text-slate-900">{stats.totalFunctional}</p>
							</div>
							<div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-sm">
							<span className="text-slate-600 font-bold bg-slate-50 px-2 py-1 rounded-md">All Time</span>
							<span className="text-slate-400 font-medium">reports logged</span>
						</div>
					</div>
				</div>

				{/* Card 2: Pass Rate */}
				<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
					<div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
					<div className="relative z-10">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="text-slate-500 font-semibold text-sm mb-1">Passed Tests</h3>
								<p className="text-4xl font-extrabold text-slate-900">{stats.passedFunctional}</p>
							</div>
							<div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-sm">
							<span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">{stats.passRate}%</span>
							<span className="text-slate-400 font-medium">pass rate</span>
						</div>
					</div>
				</div>

				{/* Card 3: Failed */}
				<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
					<div className="absolute top-0 right-0 w-28 h-28 bg-red-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
					<div className="relative z-10">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="text-slate-500 font-semibold text-sm mb-1">Failed / Alert</h3>
								<p className="text-4xl font-extrabold text-slate-900">{stats.failedFunctional}</p>
							</div>
							<div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
								</svg>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-sm">
							<span className={`font-bold px-2 py-1 rounded-md ${stats.failedFunctional > 0 ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-50"}`}>
								{stats.failedFunctional > 0 ? "Requires Review" : "All Clear ✓"}
							</span>
						</div>
					</div>
				</div>

				{/* Card 4: Active Cycles */}
				<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-slate-200 hover:shadow-md transition-all">
					<div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
					<div className="relative z-10">
						<div className="flex justify-between items-start">
							<div>
								<h3 className="text-slate-500 font-semibold text-sm mb-1">Active Reliability Cycles</h3>
								<p className="text-4xl font-extrabold text-slate-900">{stats.ongoingReliability}</p>
							</div>
							<div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
						</div>
						<div className="mt-4 flex items-center gap-2 text-sm">
							<span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
								Running
							</span>
							<span className="text-slate-400 font-medium">{stats.completedReliability} completed</span>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom Section: Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Recent Functional Tests Table */}
				<div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
					<div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
						<h3 className="font-bold text-slate-900">Recent Functional Tests</h3>
						<Link href="/reports/functional" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
							View All →
						</Link>
					</div>
					<div className="divide-y divide-slate-100">
						{stats.recentTests.length === 0 ? (
							<div className="p-12 text-center text-slate-400">
								<p className="font-semibold">No tests yet</p>
								<p className="text-sm mt-1">Submit your first functional test report.</p>
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
								<p className="text-sm font-bold text-slate-800">New Functional Test</p>
								<p className="text-xs text-slate-400">Log a QA inspection</p>
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
