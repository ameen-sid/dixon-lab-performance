import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RequesterOverview() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	// 1. Request Stats
	const requestStats = await prisma.testRequest.groupBy({
		by: ['status'],
		where: { requesterId: user.userId },
		_count: true,
	});

	const requestCounts = {
		Total: 0,
		Pending: 0,
		Approved: 0,
		Rejected: 0,
		Completed: 0,
	};

	requestStats.forEach((stat) => {
		requestCounts[stat.status as keyof typeof requestCounts] = stat._count;
		requestCounts.Total += stat._count;
	});

	// 2. Plan Stats (Active, Completed, Failed)
	const planStats = await prisma.testPlan.groupBy({
		by: ['status'],
		where: {
			inspectionResult: {
				testRequest: {
					requesterId: user.userId,
				}
			}
		},
		_count: true
	});

	const planCounts = {
		ONGOING: 0,
		COMPLETED: 0,
		FAILED: 0,
		APPROVED: 0,
	};

	planStats.forEach(s => {
		if (s.status in planCounts) {
			planCounts[s.status as keyof typeof planCounts] = s._count;
		}
	});

	const capaCount = await prisma.capaReport.count({ 
		where: { 
			submittedById: user.userId,
		} 
	});

	return (
		<div className="h-[calc(100vh-10rem)] overflow-hidden animate-in fade-in duration-700 flex flex-col">
			{/* Executive Header */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 shrink-0">
				<div>
					<h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {user.username}</h2>
				</div>
			</div>

			{/* Section: Request Overviews */}
			<div className="flex-1 min-h-0 flex flex-col justify-center pb-12">
				<div className="flex items-center gap-3 mb-8 shrink-0">
					<div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgb(59,130,246,0.5)]" />
					<h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Request Overviews</h3>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
					{/* Total Requests */}
					<div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Requests</p>
								<p className="text-5xl font-black text-slate-900 tracking-tighter">{requestCounts.Total}</p>
								<p className="text-[10px] font-bold text-slate-300 italic mt-2">Vector Matrix</p>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 transition-colors group-hover:bg-slate-900 group-hover:text-white">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
							</div>
						</div>
					</div>

					{/* Pending Requests */}
					<div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
								<p className="text-5xl font-black text-slate-900 tracking-tighter">{requestCounts.Pending}</p>
								<div className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black inline-flex items-center gap-1.5">
									<div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
									Awaiting
								</div>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							</div>
						</div>
					</div>

					{/* Approved Requests */}
					<div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved</p>
								<p className="text-5xl font-black text-slate-900 tracking-tighter">{requestCounts.Approved}</p>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							</div>
						</div>
					</div>

					{/* Reject Requests */}
					<div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rejected</p>
								<p className="text-5xl font-black text-slate-900 tracking-tighter">{requestCounts.Rejected}</p>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
							</div>
						</div>
					</div>

					{/* Completed Requests */}
					<div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
								<p className="text-5xl font-black text-slate-900 tracking-tighter">{requestCounts.Completed}</p>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
							</div>
						</div>
					</div>

					{/* CAPA Manage Overview */}
					<Link href="/dashboard/requester/capa" className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl shadow-slate-900/20 relative overflow-hidden group hover:bg-slate-800 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-white/30 uppercase tracking-widest">CAPA Artifacts</p>
								<p className="text-5xl font-black text-white tracking-tighter">{capaCount}</p>
								<p className="text-[10px] font-bold text-white/20 italic mt-2">Compliance Vault</p>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
							</div>
						</div>
						<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
					</Link>
				</div>
			</div>
		</div>
	);
}
