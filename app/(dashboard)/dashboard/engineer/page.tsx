import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EngineerDashboard() {
	const user = await getCurrentUser();

	if (!user || user.role !== "Engineer") {
		redirect("/login");
	}

	const assignedCount = await prisma.testRequest.count({
		where: { assignedToId: user.userId },
	});

	const inspectedCount = await prisma.inspectionResult.count({
		where: { inspectedById: user.userId },
	});

	const pendingInspection = assignedCount - inspectedCount;

	return (
		<div className="h-[calc(100vh-10rem)] overflow-hidden animate-in fade-in duration-700 flex flex-col">
			{/* Executive Header */}
			<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 shrink-0">
				<div>
					<h2 className="text-4xl font-black text-slate-900 tracking-tight">Welcome back, {user.username}</h2>
					<p className="text-slate-500 font-bold mt-1 text-sm tracking-tight italic">System Status: Optimal | Engineering Terminal Online</p>
				</div>
			</div>

			{/* Section: Operational Overviews */}
			<div className="flex-1 min-h-0 flex flex-col justify-center pb-12">
				<div className="flex items-center gap-3 mb-8 shrink-0">
					<div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgb(59,130,246,0.5)]" />
					<h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Overviews</h3>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{/* Total Assignments */}
					<Link href="/dashboard/engineer/samples" className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Assignments</p>
								<p className="text-5xl font-black text-slate-900 tracking-tighter">{assignedCount}</p>
								<p className="text-[10px] font-bold text-slate-300 italic mt-2">Workload Matrix</p>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 transition-colors group-hover:bg-slate-900 group-hover:text-white">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
							</div>
						</div>
					</Link>

					{/* Pending Inspections */}
					<div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Action</p>
								<p className="text-5xl font-black text-slate-900 tracking-tighter">{pendingInspection}</p>
								<div className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black inline-flex items-center gap-1.5">
									<div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
									Critical Execution
								</div>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							</div>
						</div>
					</div>

					{/* Completed Inspections */}
					<div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
								<p className="text-5xl font-black text-slate-900 tracking-tighter">{inspectedCount}</p>
								<p className="text-[10px] font-bold text-slate-300 italic mt-2">Audit History Ready</p>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							</div>
						</div>
					</div>

					{/* Execution Efficiency */}
					<div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-2xl shadow-slate-900/20 relative overflow-hidden group hover:bg-slate-800 transition-all">
						<div className="flex justify-between items-start mb-4 relative z-10">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Efficiency</p>
								<p className="text-5xl font-black text-white tracking-tighter">
									{assignedCount > 0 ? Math.round((inspectedCount / assignedCount) * 100) : 0}%
								</p>
								<p className="text-[10px] font-bold text-white/20 italic mt-2">Performance Vector</p>
							</div>
							<div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
							</div>
						</div>
						<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
					</div>
				</div>
			</div>
		</div>
	);
}
