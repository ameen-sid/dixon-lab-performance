import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import HeadDashboardCharts from "@/src/components/head/HeadDashboardCharts";

export default async function HeadDashboard() {
	const user = await getCurrentUser();

	if (!user || user.role !== "Head") {
		redirect("/login");
	}

	// 1. Fetch Test Plans with Categories for the Cards
	const testPlans = await prisma.testPlan.findMany({
		include: { testType: true }
	});

	const targetCategories = ["Performance", "Reliability", "NABL"];
	
	const categoryStats = targetCategories.map(catName => {
		const plans = testPlans.filter(p => p.testType?.name?.toLowerCase().includes(catName.toLowerCase()));
		
		let total = plans.length;
		let pass = plans.filter(p => p.status === 'COMPLETED' || p.status === 'APPROVED').length;
		let ongoing = plans.filter(p => p.status === 'ONGOING' || p.status === 'PLANNED' || p.status === 'PENDING_APPROVAL').length;
		let failed = plans.filter(p => p.status === 'FAILED').length;

		return { name: catName, total, pass, ongoing, failed };
	});

	// --- Existing Chart Data Fetching ---
	const requestStats = await prisma.testRequest.groupBy({ by: ['status'], _count: true });
	let totalRequests = 0, pendingReq = 0, approvedReq = 0, rejectedReq = 0;
	requestStats.forEach((stat) => {
		totalRequests += stat._count;
		if (stat.status === 'Pending') pendingReq = stat._count;
		if (stat.status === 'Approved' || stat.status === 'Completed') approvedReq += stat._count;
		if (stat.status === 'Rejected') rejectedReq = stat._count;
	});
	const requestData = [
		{ name: 'Total', count: totalRequests }, 
		{ name: 'Approved', count: approvedReq },
		{ name: 'Pending', count: pendingReq },
		{ name: 'Rejected', count: rejectedReq },
	];

	const testStats = await prisma.testPlan.groupBy({ by: ['status'], _count: true });
	let completedReports = 0, failureReports = 0;
	testStats.forEach((stat) => {
		if (stat.status === "PENDING_APPROVAL" || stat.status === "COMPLETED" || stat.status === "APPROVED") completedReports += stat._count;
		if (stat.status === "FAILED") failureReports += stat._count;
	});
	const reportData = [
		{ name: 'Completed Reports', value: completedReports },
		{ name: 'Failure Reports', value: failureReports },
	];

	const capaGroup = await prisma.capaReport.groupBy({ by: ['submittedById'], _count: true });
	const userIds = capaGroup.map(g => g.submittedById);
	const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
	const userMap = new Map(users.map(u => [u.id, u.name]));
	let capaSubmitterData = capaGroup.map(g => ({
		name: userMap.get(g.submittedById) || `User ${g.submittedById}`,
		count: g._count
	}));

	return (
		<div className="pb-20 animate-in fade-in duration-700">
			{/* Executive Header */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 shrink-0">
				<div>
					<h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {user.username}</h2>
					<p className="text-slate-500 font-bold mt-1 text-sm tracking-tight italic">System Status: Optimal | Directorate Oversight Online</p>
				</div>
			</div>

			{/* Category Cards Section */}
			<div className="space-y-6 mb-12">
				{categoryStats.map((category) => (
					<div key={category.name}>
						<div className="flex items-center gap-2 mb-3 shrink-0">
							<div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgb(59,130,246,0.5)]" />
							<h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{category.name} Operations</h3>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							{/* Total Tests */}
							<div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
								<div className="flex justify-between items-start relative z-10">
									<div className="space-y-1">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tests</p>
										<p className="text-3xl font-black text-slate-900 tracking-tighter">{category.total}</p>
									</div>
									<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
									</div>
								</div>
							</div>

							{/* Pass Tests */}
							<div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
								<div className="flex justify-between items-start relative z-10">
									<div className="space-y-1">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass Tests</p>
										<p className="text-3xl font-black text-slate-900 tracking-tighter">{category.pass}</p>
									</div>
									<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									</div>
								</div>
							</div>

							{/* Ongoing Tests */}
							<div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
								<div className="flex justify-between items-start relative z-10">
									<div className="space-y-1">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ongoing Tests</p>
										<p className="text-3xl font-black text-slate-900 tracking-tighter">{category.ongoing}</p>
									</div>
									<div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									</div>
								</div>
							</div>

							{/* Failed Tests */}
							<div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl shadow-slate-900/10 relative overflow-hidden group hover:bg-rose-900 transition-colors">
								<div className="flex justify-between items-start relative z-10">
									<div className="space-y-1">
										<p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Failed Tests</p>
										<p className="text-3xl font-black text-white tracking-tighter">{category.failed}</p>
									</div>
									<div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
									</div>
								</div>
								<div className="absolute -right-2 -bottom-2 w-16 h-16 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/30 transition-colors" />
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="w-full h-px bg-slate-200 my-16" />

			{/* Analytical Charts */}
			<div>
				<div className="flex items-center gap-3 mb-8 shrink-0">
					<div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgb(99,102,241,0.5)]" />
					<h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Graphical Telemetry</h3>
				</div>
				<HeadDashboardCharts 
					requestData={requestData} 
					reportData={reportData} 
					capaSubmitterData={capaSubmitterData} 
					trendData={[]} 
				/>
			</div>
		</div>
	);
}
