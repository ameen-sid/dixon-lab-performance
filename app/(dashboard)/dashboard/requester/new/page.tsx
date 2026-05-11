import { getCurrentUser } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewRequestPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");

	async function createRequest(formData: FormData) {
		"use server";

		const samplePartName = formData.get("samplePartName") as string;
		const samplePartNo = formData.get("samplePartNo") as string;
		const customerSupplierName = formData.get("customerSupplierName") as string;
		const sampleQuantity = parseInt(formData.get("sampleQuantity") as string);
		const modelIdentification = formData.get("modelIdentification") as string;
		const department = formData.get("department") as string;
		const testName = formData.get("testName") as string;
		const testStandard = formData.get("testStandard") as string;
		const testPurpose = formData.get("testPurpose") as string;
		const remarks = formData.get("remarks") as string;

		const user = await getCurrentUser();
		if (!user) return;

		await prisma.testRequest.create({
			data: {
				samplePartName,
				samplePartNo,
				customerSupplierName,
				sampleQuantity,
				modelIdentification,
				department,
				testName,
				testStandard,
				testPurpose,
				remarks,
				requesterId: user.userId,
			},
		});

		redirect("/dashboard/requester/requests");
	}

	return (
		<div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="mb-8 flex justify-between items-end">
				<div>
					<Link
						href="/dashboard/requester/requests"
						className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Back to Requests
					</Link>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						New Test Request
					</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Please provide detailed information for the laboratory test.
					</p>
				</div>
			</div>

			<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
				<form action={createRequest} className="p-8 space-y-8">
					{/* Section 1: Sample Information */}
					<div>
						<h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
							<span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
							Sample Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700 ml-1">Sample / Part Name</label>
								<input
									type="text"
									name="samplePartName"
									required
									placeholder="e.g. Main PCB Assembly"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700 ml-1">Sample / Part No</label>
								<input
									type="text"
									name="samplePartNo"
									placeholder="e.g. DIX-10293-X"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700 ml-1">Customer / Supplier Name</label>
								<input
									type="text"
									name="customerSupplierName"
									placeholder="e.g. Samsung / Dixon"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700 ml-1">Sample Quantity</label>
								<input
									type="number"
									name="sampleQuantity"
									required
									min="1"
									defaultValue="1"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700 ml-1">Model / Identification</label>
								<input
									type="text"
									name="modelIdentification"
									placeholder="e.g. P1-UI-1.5"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700 ml-1">Department</label>
								<input
									type="text"
									name="department"
									placeholder="e.g. R&D / Quality"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
								/>
							</div>
						</div>
					</div>

					{/* Section 2: Test Details */}
					<div>
						<h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
							<span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
							Test Details
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700 ml-1">Test Name</label>
								<input
									type="text"
									name="testName"
									placeholder="e.g. Thermal Cycling / Salt Spray"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-bold text-slate-700 ml-1">Test Standard / Reference</label>
								<input
									type="text"
									name="testStandard"
									placeholder="e.g. IEC 60068-2-1 / ISO 9001"
									className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
								/>
							</div>
						</div>
						<div className="mt-6 space-y-2">
							<label className="text-sm font-bold text-slate-700 ml-1">Purpose of Testing</label>
							<textarea
								name="testPurpose"
								rows={3}
								placeholder="What is the goal of this test?"
								className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 resize-none"
							/>
						</div>
					</div>

					{/* Section 3: Additional Info */}
					<div>
						<h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
							<span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs">3</span>
							Additional Info
						</h3>
						<div className="space-y-2">
							<label className="text-sm font-bold text-slate-700 ml-1">Remarks</label>
							<textarea
								name="remarks"
								rows={3}
								placeholder="Any other details the lab should know..."
								className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 resize-none"
							/>
						</div>
					</div>

					<div className="pt-4">
						<button
							type="submit"
							className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 transition-all transform active:scale-[0.98]"
						>
							Submit Request
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
