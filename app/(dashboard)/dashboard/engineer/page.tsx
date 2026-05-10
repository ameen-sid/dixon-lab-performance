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
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
					Engineer Dashboard
				</h2>
				<p className="text-slate-500 mt-1 font-medium">
					Welcome, {user.username}. Manage your assigned samples and inspections.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Assigned Samples</h3>
					<p className="text-3xl font-extrabold text-slate-900">{assignedCount}</p>
					<Link href="/dashboard/engineer/samples" className="mt-4 inline-block text-xs font-bold text-blue-600 hover:underline">
						View my samples →
					</Link>
				</div>

				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-amber-600">Pending Inspection</h3>
					<p className="text-3xl font-extrabold text-slate-900">{pendingInspection}</p>
					<p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Requires Action</p>
				</div>

				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-emerald-600">Completed</h3>
					<p className="text-3xl font-extrabold text-slate-900">{inspectedCount}</p>
					<p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Inspections Done</p>
				</div>
			</div>
		</div>
	);
}
