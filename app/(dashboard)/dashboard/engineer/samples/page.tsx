import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EngineerSamplesPage() {
	const user = await getCurrentUser();

	if (!user || user.role !== "Engineer") {
		redirect("/login");
	}

	const samples = await prisma.testRequest.findMany({
		where: { assignedToId: user.userId },
		include: {
			requester: true,
			inspection: true,
		},
		orderBy: { createdAt: "desc" },
	});

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
					My Assigned Samples
				</h2>
				<p className="text-slate-500 mt-1 font-medium">
					Complete inspections for the samples assigned to you by the lab manager.
				</p>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead>
							<tr className="bg-slate-50/50 border-b border-slate-100">
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample / Part</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
								<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{samples.map((sample) => (
								<tr key={sample.id} className="hover:bg-slate-50/50 transition-colors group">
									<td className="px-6 py-4">
										<p className="text-sm font-bold text-slate-800">{sample.samplePartName}</p>
										<p className="text-[10px] text-slate-400 font-medium">{sample.samplePartNo || "N/A"}</p>
									</td>
									<td className="px-6 py-4 text-sm font-medium text-slate-600">
										{sample.modelIdentification || "N/A"}
									</td>
									<td className="px-6 py-4 text-sm font-medium text-slate-600">
										{sample.department || "N/A"}
									</td>
									<td className="px-6 py-4">
										<span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
											sample.inspection ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
										}`}>
											{sample.inspection ? "Inspected" : "Awaiting Inspection"}
										</span>
									</td>
									<td className="px-6 py-4 text-right">
										{sample.inspection ? (
											<Link 
												href={`/dashboard/engineer/inspect/${sample.id}`}
												className="text-xs font-bold text-slate-400 hover:text-slate-600 underline decoration-slate-200"
											>
												View Report
											</Link>
										) : (
											<Link 
												href={`/dashboard/engineer/inspect/${sample.id}`}
												className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
											>
												Inspect Now
											</Link>
										)}
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
