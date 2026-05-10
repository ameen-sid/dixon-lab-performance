import prisma from "@/src/lib/prisma";
import { getCurrentUser } from "@/src/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyRequestsPage() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/login");
	}

	const requests = await prisma.testRequest.findMany({
		where: { requesterId: user.userId },
		orderBy: { createdAt: "desc" },
	});

	return (
		<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
			<div className="mb-8 flex justify-between items-center">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						My Test Requests
					</h2>
					<p className="text-slate-500 mt-1 font-medium">
						List of all your submitted test requests and their statuses.
					</p>
				</div>
				<Link
					href="/dashboard/requester/new"
					className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 transform active:scale-95"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					New Request
				</Link>
			</div>

			<div className="grid grid-cols-1 gap-4">
				{requests.length === 0 ? (
					<div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
						<div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
							<svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<h3 className="text-lg font-bold text-slate-900">No requests yet</h3>
						<p className="text-slate-500 mt-1">Start by creating your first test request.</p>
						<Link
							href="/dashboard/requester/new"
							className="mt-6 inline-flex items-center text-blue-600 font-bold hover:text-blue-700"
						>
							Create Request →
						</Link>
					</div>
				) : (
					<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead>
									<tr className="bg-slate-50/50 border-b border-slate-100">
										<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample / Part</th>
										<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model</th>
										<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quantity</th>
										<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
										<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Feedback/Remarks</th>
										<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{requests.map((request) => (
										<tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
											<td className="px-6 py-4">
												<p className="text-sm font-bold text-slate-800">{request.samplePartName}</p>
												<p className="text-xs text-slate-400">{request.samplePartNo || "N/A"}</p>
											</td>
											<td className="px-6 py-4 text-sm font-medium text-slate-600">
												{request.modelIdentification || "N/A"}
											</td>
											<td className="px-6 py-4 text-sm font-medium text-slate-600">
												{request.testName || "N/A"}
											</td>
											<td className="px-6 py-4 text-sm font-medium text-slate-600">
												{request.sampleQuantity}
											</td>
											<td className="px-6 py-4">
												<span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
													request.status === "Pending" ? "bg-amber-100 text-amber-700" :
													request.status === "Approved" ? "bg-blue-100 text-blue-700" :
													request.status === "Rejected" ? "bg-red-100 text-red-700" :
													"bg-emerald-100 text-emerald-700"
												}`}>
													<span className={`w-1.5 h-1.5 rounded-full ${
														request.status === "Pending" ? "bg-amber-500 animate-pulse" :
														request.status === "Approved" ? "bg-blue-500" :
														request.status === "Rejected" ? "bg-red-500" :
														"bg-emerald-500"
													}`} />
													{request.status}
												</span>
											</td>
											<td className="px-6 py-4">
												<p className="text-xs text-slate-500 max-w-[200px] truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
													{request.remarks || "—"}
												</p>
											</td>
											<td className="px-6 py-4 text-xs text-slate-400">
												{new Date(request.createdAt).toLocaleDateString("en-IN", {
													day: "2-digit",
													month: "short",
													year: "numeric",
												})}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
