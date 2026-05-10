import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ManagerDashboard() {
	const user = await getCurrentUser();

	if (!user || user.role !== "Lab Manager") {
		redirect("/login");
	}

	const approvedCount = await prisma.testRequest.count({
		where: { status: "Approved" },
	});

	const assignedCount = await prisma.testRequest.count({
		where: { 
			status: "Approved",
			assignedToId: { not: null }
		},
	});

	const passedInspection = await prisma.inspectionResult.count({
		where: { isPassed: true }
	});

	const failedInspection = await prisma.inspectionResult.count({
		where: { isPassed: false }
	});

	const pendingAssignment = approvedCount - assignedCount;

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
					Lab Manager Dashboard
				</h2>
				<p className="text-slate-500 mt-1 font-medium">
					Oversee lab operations and assign tasks to engineers.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">Approved Requests</h3>
					<p className="text-3xl font-extrabold text-slate-900">{approvedCount}</p>
					<Link href="/dashboard/manager/requests" className="mt-4 inline-block text-xs font-bold text-blue-600 hover:underline">
						View queue →
					</Link>
				</div>

				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-amber-600">Pending Assignment</h3>
					<p className="text-3xl font-extrabold text-slate-900">{pendingAssignment}</p>
					<p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Action Required</p>
				</div>

				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-emerald-600">Passed Samples</h3>
					<p className="text-3xl font-extrabold text-slate-900">{passedInspection}</p>
					<Link href="/dashboard/manager/requests?filter=passed" className="mt-4 inline-block text-xs font-bold text-emerald-600 hover:underline">
						Ready for Testing →
					</Link>
				</div>

				<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
					<div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full" />
					<h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1 text-red-600">Failed Samples</h3>
					<p className="text-3xl font-extrabold text-slate-900">{failedInspection}</p>
					<Link href="/dashboard/manager/requests?filter=failed" className="mt-4 inline-block text-xs font-bold text-red-600 hover:underline">
						Review issues →
					</Link>
				</div>
			</div>
		</div>
	);
}
