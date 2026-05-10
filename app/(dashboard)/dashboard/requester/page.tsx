import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RequesterOverview() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const stats = await prisma.testRequest.groupBy({
		by: ['status'],
		where: { requesterId: user.userId },
		_count: true,
	});

	const counts = {
		Total: 0,
		Pending: 0,
		Approved: 0,
		Rejected: 0,
		Completed: 0,
	};

	stats.forEach((stat) => {
		counts[stat.status as keyof typeof counts] = stat._count;
		counts.Total += stat._count;
	});

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
					Requester Dashboard
				</h2>
				<p className="text-slate-500 mt-1 font-medium">
					Welcome, {user.username}. Here is an overview of your test requests.
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Total Requests */}
				<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-all">
					<div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
					<div className="relative z-10">
						<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Total Requests</h3>
						<p className="text-3xl font-extrabold text-slate-900">{counts.Total}</p>
						<div className="mt-4 flex items-center gap-2">
							<Link href="/dashboard/requester/requests" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
								View All
								<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
								</svg>
							</Link>
						</div>
					</div>
				</div>

				{/* Pending */}
				<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-amber-200 transition-all">
					<div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
					<div className="relative z-10">
						<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-amber-600">Pending Approval</h3>
						<p className="text-3xl font-extrabold text-slate-900">{counts.Pending}</p>
						<div className="mt-4">
							<span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full uppercase tracking-tighter">In Queue</span>
						</div>
					</div>
				</div>

				{/* Approved */}
				<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-emerald-200 transition-all">
					<div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
					<div className="relative z-10">
						<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-emerald-600">Approved Tests</h3>
						<p className="text-3xl font-extrabold text-slate-900">{counts.Approved}</p>
						<div className="mt-4">
							<span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-tighter">Ready / Active</span>
						</div>
					</div>
				</div>

				{/* Rejected */}
				<div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:border-red-200 transition-all">
					<div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
					<div className="relative z-10">
						<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-red-600">Rejected</h3>
						<p className="text-3xl font-extrabold text-slate-900">{counts.Rejected}</p>
						<div className="mt-4">
							<span className="text-[10px] font-bold bg-red-50 text-red-700 px-2 py-1 rounded-full uppercase tracking-tighter">Action Required</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
