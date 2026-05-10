import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import AssignmentPanel from "@/src/components/manager/AssignmentPanel";

export default async function ManagerRequestsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
	const user = await getCurrentUser();

	if (!user || user.role !== "Lab Manager") {
		redirect("/login");
	}

	const { filter } = await searchParams;

	const where: any = { status: "Approved" };
	if (filter === "passed") where.inspection = { isPassed: true };
	if (filter === "failed") where.inspection = { isPassed: false };

	const requests = await prisma.testRequest.findMany({
		where,
		include: {
			requester: true,
			assignedTo: true,
			inspection: true,
		},
		orderBy: { createdAt: "desc" },
	});

	const engineers = await prisma.user.findMany({
		where: { 
			role: "Engineer"
		}
	});

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
					Approved Lab Requests
				</h2>
				<p className="text-slate-500 mt-1 font-medium">
					Assign engineers and trigger notifications for head-approved tests.
				</p>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-slate-50/50 border-b border-slate-100">
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample / Part</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Requester</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Test Name</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inspection Result</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{requests.map((request) => (
								<tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
									<td className="px-6 py-4">
										<p className="text-sm font-bold text-slate-800">{request.samplePartName}</p>
										<p className="text-[10px] text-slate-400 font-medium">{request.modelIdentification || "No Model"}</p>
									</td>
									<td className="px-6 py-4">
										<p className="text-sm font-bold text-slate-800">{request.requester.name}</p>
										<p className="text-[10px] text-slate-400 font-medium">{request.department || "N/A"}</p>
									</td>
									<td className="px-6 py-4 text-sm font-medium text-slate-600">
										{request.testName || "N/A"}
									</td>
									<td className="px-6 py-4">
										{request.assignedTo ? (
											<div className="flex items-center gap-2">
												<div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
													{request.assignedTo.name.charAt(0)}
												</div>
												<p className="text-xs font-bold text-slate-700">{request.assignedTo.name}</p>
											</div>
										) : (
											<span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">Unassigned</span>
										)}
									</td>
									<td className="px-6 py-4">
										{request.inspection ? (
											<span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md ${
												request.inspection.isPassed 
													? "bg-emerald-100 text-emerald-700" 
													: "bg-red-100 text-red-700"
											}`}>
												{request.inspection.isPassed ? "PASS" : "FAIL"}
											</span>
										) : (
											<span className="text-[10px] font-bold text-slate-300 italic">Awaiting...</span>
										)}
									</td>
									<td className="px-6 py-4 text-right">
										<AssignmentPanel 
											request={request} 
											engineers={engineers} 
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
