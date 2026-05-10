import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HeadDashboard() {
	const user = await getCurrentUser();

	if (!user || user.role !== "Head") {
		redirect("/login");
	}

	const stats = await prisma.testRequest.groupBy({
		by: ['status'],
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
					Head Overview
				</h2>
				<p className="text-slate-500 mt-1 font-medium">
					Monitor and manage all laboratory test requests.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Total */}
				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Global Requests</h3>
					<p className="text-3xl font-extrabold text-slate-900">{counts.Total}</p>
					<Link href="/dashboard/head/requests" className="mt-4 inline-block text-xs font-bold text-blue-600 hover:underline">
						View all requests →
					</Link>
				</div>

				{/* Pending */}
				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-amber-600">Awaiting Approval</h3>
					<p className="text-3xl font-extrabold text-slate-900">{counts.Pending}</p>
					<p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Requires Action</p>
				</div>

				{/* Approved */}
				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-emerald-600">Approved</h3>
					<p className="text-3xl font-extrabold text-slate-900">{counts.Approved}</p>
					<p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">In Progress</p>
				</div>

				{/* Rejected */}
				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-red-600">Rejected</h3>
					<p className="text-3xl font-extrabold text-slate-900">{counts.Rejected}</p>
					<p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Archived</p>
				</div>
			</div>
		</div>
	);
}
