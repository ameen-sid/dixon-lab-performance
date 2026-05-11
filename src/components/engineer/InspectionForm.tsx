"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface Props {
	request: any;
	user: any;
	onSubmit: (formData: FormData) => Promise<void>;
}

export default function InspectionForm({ request, user, onSubmit }: Props) {
	const [imagePreview, setImagePreview] = useState<string | null>(request.inspection?.imageUrl || null);
	const [loading, setLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isViewOnly = !!request.inspection;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		const formData = new FormData(e.currentTarget);

		// If we have a preview but no new file, it might be the old one. 
		// The server action handles the image URL update.

		await onSubmit(formData);
		setLoading(false);
	};

	const checkPoints = [
		{ id: "point1", label: "Is Sample Description same as written on Test Request Form?", val: request.inspection?.descriptionMatch },
		{ id: "point2", label: "Is Model / Identification same as written on Test Request Form?", val: request.inspection?.modelMatch },
		{ id: "point3", label: "Is Product Serial Number same as written on Test Request Form?", val: request.inspection?.serialMatch },
		{ id: "point4", label: "Is Label available on sample?", val: request.inspection?.labelAvailable },
		{ id: "point5", label: "Is Sample Rating same as written on Test Request Form?", val: request.inspection?.ratingMatch },
		{ id: "point6", label: "Is Trade Mark / Brand same as written on Test Request Form?", val: request.inspection?.brandMatch },
		{ id: "point7", label: "Is User Manual provided along with Test Request Form?", val: request.inspection?.manualProvided },
		{ id: "point8", label: "Any sign of Damage on sample", val: request.inspection?.damageSign },
		{ id: "point9", label: "Is all accessories received with sample?", val: request.inspection?.accessoriesReceived },
	];

	return (
		<div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="mb-8 flex justify-between items-end">
				<div>
					<Link
						href={user.role === "Lab Manager" ? "/dashboard/manager/requests" : "/dashboard/engineer/samples"}
						className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-4 transition-colors"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Back to Samples
					</Link>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						Sample Inspection Check List
					</h2>
					<p className="text-slate-500 mt-1 font-medium italic">
						Product / Part check List before testing
					</p>
				</div>
				<div className="text-right">
					<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inspected By</p>
					<p className="text-sm font-bold text-slate-700">{request.inspection?.inspectedBy || user.name}</p>
				</div>
			</div>

			<div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
				<form onSubmit={handleSubmit} className="p-10">
					<div className="overflow-hidden border border-slate-100 rounded-3xl">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-slate-50 border-b border-slate-100">
									<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-16 text-center">Sr. No</th>
									<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Check Point</th>
									<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-64">Observation</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{checkPoints.map((point, index) => (
									<tr key={point.id} className="hover:bg-slate-50/30 transition-colors">
										<td className="px-6 py-5 text-sm font-bold text-slate-400 text-center">{index + 1}</td>
										<td className="px-6 py-5 text-sm font-medium text-slate-700 select-none">{point.label}</td>
										<td className="px-6 py-5">
											<div className="flex gap-2 w-full max-w-[240px]">
												{["Yes", "No", "N.A"].map((option) => (
													<label key={option} className="flex-1 cursor-pointer group">
														<input
															type="radio"
															name={point.id}
															value={option}
															required
															disabled={isViewOnly}
															defaultChecked={point.val === option}
															className="absolute opacity-0 w-0 h-0 peer"
														/>
														<div className="text-[10px] font-bold py-2 text-center rounded-lg border border-slate-200 peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 peer-focus:ring-2 peer-focus:ring-slate-900/10 transition-all hover:bg-slate-50">
															{option}
														</div>
													</label>
												))}
											</div>
										</td>
									</tr>
								))}

								<tr className="bg-slate-50/30">
									<td className="px-6 py-5 text-sm font-bold text-slate-400 text-center">10</td>
									<td className="px-6 py-5 text-sm font-medium text-slate-700 font-bold uppercase tracking-tight">Sample Id allotted</td>
									<td className="px-6 py-5">
										<input
											type="text"
											name="point10"
											required
											disabled={isViewOnly}
											defaultValue={request.inspection?.allottedId || request.samplePartNo || ""}
											placeholder="Enter ID..."
											className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none"
										/>
									</td>
								</tr>
								<tr>
									<td className="px-6 py-5 text-sm font-bold text-slate-400 text-center">11</td>
									<td className="px-6 py-5 text-sm font-medium text-slate-700 font-bold uppercase tracking-tight">Remarks (If any)</td>
									<td className="px-6 py-5">
										<textarea
											name="point11"
											rows={2}
											disabled={isViewOnly}
											defaultValue={request.inspection?.remarks || ""}
											placeholder="Add notes..."
											className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none resize-none"
										/>
									</td>
								</tr>
								<tr className="bg-slate-50/30">
									<td className="px-6 py-5 text-sm font-bold text-slate-400 text-center">12</td>
									<td className="px-6 py-5 text-sm font-medium text-slate-700 font-bold uppercase tracking-tight">Sample Picture upload</td>
									<td className="px-6 py-5">
										<div
											onClick={() => !isViewOnly && fileInputRef.current?.click()}
											className={`w-full h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center bg-white group transition-all relative overflow-hidden ${isViewOnly ? "border-slate-100 cursor-default" : "border-slate-200 cursor-pointer hover:border-blue-300"
												}`}
										>
											{imagePreview ? (
												<div 
													onClick={(e) => {
														if (isViewOnly && imagePreview) {
															e.stopPropagation();
															window.open(imagePreview, "_blank");
														}
													}}
													className={`w-full h-full relative group/img ${isViewOnly ? "cursor-pointer" : ""}`}
												>
													<img
														src={imagePreview}
														alt="Preview"
														className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover/img:scale-110"
													/>
												</div>
											) : (
												<>
													<svg className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
													<span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest group-hover:text-blue-500">
														Click to Upload Pic
													</span>
												</>
											)}
											<input
												type="file"
												name="samplePic"
												ref={fileInputRef}
												onChange={handleFileChange}
												accept="image/*"
												className="hidden"
											/>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					{!isViewOnly && (
						<div className="mt-10 flex justify-end">
							<button
								type="submit"
								disabled={loading}
								className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 transform active:scale-95 disabled:bg-slate-400"
							>
								{loading ? "Submitting..." : "Submit Inspection Report"}
							</button>
						</div>
					)}
				</form>
			</div>
		</div>
	);
}
