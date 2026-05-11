"use client";

import { useState, useEffect, useMemo } from "react";
import { createTestPlan } from "@/src/app/actions/manager-actions";
import { format, addDays } from "date-fns";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	inspectionId: number;
	requestDetails: { name: string, model: string };
}

export default function CreateTestPlanModal({ isOpen, onClose, inspectionId, requestDetails }: ModalProps) {
	const [loading, setLoading] = useState(false);
	const [metadata, setMetadata] = useState<any>(null);
	
	const [formData, setFormData] = useState({
		testTypeId: "",
		testCategoryId: "",
		testProtocolId: "",
		numDays: 7,
		startDate: format(new Date(), "yyyy-MM-dd"),
		endDate: format(addDays(new Date(), 6), "yyyy-MM-dd"),
		remarks: "",
		referenceStd: "",
		stationIds: [] as string[],
		productType: "SATL"
	});

	useEffect(() => {
		async function fetchMetadata() {
			const res = await fetch("/api/manager/test-metadata");
			if (res.ok) {
				const data = await res.json();
				setMetadata(data);
			}
		}
		if (isOpen) fetchMetadata();
	}, [isOpen]);

	// Auto-calculate end date
	useEffect(() => {
		if (formData.startDate && formData.numDays) {
			const start = new Date(formData.startDate);
			if (!isNaN(start.getTime())) {
				const end = addDays(start, formData.numDays - 1);
				setFormData(prev => ({ ...prev, endDate: format(end, "yyyy-MM-dd") }));
			}
		}
	}, [formData.startDate, formData.numDays]);

	// Platforms memo for station selection
	const platforms = useMemo(() => {
		if (!metadata?.stations) return [];
		const groups: Record<string, any[]> = {};
		metadata.stations.forEach((s: any) => {
			if (!groups[s.platformId]) groups[s.platformId] = [];
			groups[s.platformId].push(s);
		});
		return Object.entries(groups).map(([id, stns]) => ({
			id,
			stations: stns.sort((a, b) => {
				const aNum = parseInt(a.id.split("-S")[1] || "0");
				const bNum = parseInt(b.id.split("-S")[1] || "0");
				return aNum - bNum;
			})
		})).sort((a, b) => {
			const aNum = parseInt(a.id.replace("P", ""));
			const bNum = parseInt(b.id.replace("P", ""));
			return aNum - bNum;
		});
	}, [metadata?.stations]);

	const filteredCategories = useMemo(() => {
		if (!formData.testTypeId || !metadata?.categories) return [];
		return metadata.categories.filter((c: any) => c.testTypeId === parseInt(formData.testTypeId));
	}, [metadata?.categories, formData.testTypeId]);

	const isReliabilitySelected = useMemo(() => {
		if (!formData.testTypeId || !metadata?.testTypes) return false;
		const type = metadata.testTypes.find((t: any) => t.id === parseInt(formData.testTypeId));
		return type?.name.toLowerCase().includes("reliability");
	}, [metadata?.testTypes, formData.testTypeId]);

	const filteredProtocols = useMemo(() => {
		if (!formData.testCategoryId || !metadata?.protocols) return [];
		return metadata.protocols.filter((p: any) => {
			const catMatch = p.testCategoryId === parseInt(formData.testCategoryId);
			if (isReliabilitySelected) {
				return catMatch && p.productType === formData.productType;
			}
			return catMatch;
		});
	}, [metadata?.protocols, formData.testCategoryId, isReliabilitySelected, formData.productType]);

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await createTestPlan({
				...formData,
				inspectionId,
				testTypeId: parseInt(formData.testTypeId),
				testCategoryId: parseInt(formData.testCategoryId),
				testProtocolId: parseInt(formData.testProtocolId),
				stationIds: formData.stationIds.join(","),
			});
			onClose();
		} catch (error) {
			alert("Failed to create test plan");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
			<div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
				<div className="bg-slate-900 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
					<h3 className="text-white font-bold uppercase tracking-tight">Schedule New Test Plan</h3>
					<button onClick={onClose} className="text-slate-400 hover:text-white">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<form onSubmit={handleSubmit} className="p-8 space-y-6">
					
					{/* New Linked Request Field (Disabled) */}
					<div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
						<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Linked Request / Sample</label>
						<div className="flex gap-4">
							<div className="flex-1">
								<input 
									type="text" 
									disabled 
									value={requestDetails.name} 
									className="w-full px-4 py-2 bg-slate-200/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
								/>
							</div>
							<div className="flex-1">
								<input 
									type="text" 
									disabled 
									value={`Model: ${requestDetails.model}`} 
									className="w-full px-4 py-2 bg-slate-200/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
								/>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div>
							<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Test Type</label>
							<select
								value={formData.testTypeId}
								onChange={(e) => setFormData({ ...formData, testTypeId: e.target.value, testCategoryId: "", testProtocolId: "" })}
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold"
							>
								<option value="">Select Type...</option>
								{metadata?.testTypes?.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Test Category</label>
							<select
								value={formData.testCategoryId}
								onChange={(e) => setFormData({ ...formData, testCategoryId: e.target.value, testProtocolId: "" })}
								disabled={!formData.testTypeId}
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold disabled:opacity-50"
							>
								<option value="">Select Category...</option>
								{filteredCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
							</select>
						</div>
					</div>

					{isReliabilitySelected && (
						<div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Product Type (for Reliability)</label>
								<div className="grid grid-cols-4 gap-3">
									{["SATL", "FATL", "FAFL", "WASH"].map((pt) => (
										<button
											key={pt}
											type="button"
											onClick={() => setFormData({ ...formData, productType: pt, testProtocolId: "" })}
											className={`py-3 rounded-2xl text-[10px] font-black border-2 transition-all ${formData.productType === pt
												? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
												: "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
												}`}
										>
											{pt}
										</button>
									))}
								</div>
							</div>

							<div>
								<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Assign Stations (Platforms)</label>
								<div className="space-y-4 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-3xl border border-slate-100 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
									{platforms.map((p: any) => (
										<div key={p.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
											<p className="text-[9px] font-black text-slate-400 uppercase mb-3 px-1">{p.id}</p>
											<div className="grid grid-cols-5 gap-2">
												{p.stations.map((s: any) => {
													const isSelected = formData.stationIds.includes(s.id);
													const isOccupied = s.status === "OCCUPIED" && !isSelected;

													return (
														<button
															key={s.id}
															type="button"
															disabled={isOccupied}
															onClick={() => {
																const newIds = isSelected
																	? formData.stationIds.filter(id => id !== s.id)
																	: [...formData.stationIds, s.id];
																setFormData({ ...formData, stationIds: newIds });
															}}
															className={`py-2 rounded-xl text-[10px] font-bold border transition-all relative group/stn ${isSelected
																? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
																: isOccupied
																	? "bg-rose-50 border-rose-100 text-rose-300 cursor-not-allowed"
																	: "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
																}`}
														>
															{s.id.split("-S")[1]}
															{isOccupied && (
																<span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />
															)}
														</button>
													);
												})}
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					<div>
						<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Test Protocol</label>
						<select
							value={formData.testProtocolId}
							onChange={(e) => setFormData({ ...formData, testProtocolId: e.target.value })}
							disabled={!formData.testCategoryId}
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold disabled:opacity-50"
						>
							<option value="">Select Protocol...</option>
							{filteredProtocols.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
						</select>
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div>
							<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Reference Standard</label>
							<input
								type="text"
								value={formData.referenceStd}
								onChange={(e) => setFormData({ ...formData, referenceStd: e.target.value })}
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold"
								placeholder="e.g. IEC 60335-2-7"
							/>
						</div>
						<div>
							<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Number of Days</label>
							<input
								type="number"
								value={formData.numDays}
								onChange={(e) => setFormData({ ...formData, numDays: parseInt(e.target.value) || 0 })}
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div>
							<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
							<input
								type="date"
								value={formData.startDate}
								onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold"
							/>
						</div>
						<div>
							<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Date (Auto-calculated)</label>
							<input
								type="date"
								value={formData.endDate}
								readOnly
								className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-bold text-slate-400 cursor-not-allowed"
							/>
						</div>
					</div>

					<div>
						<label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Remarks (Optional)</label>
						<textarea
							rows={3}
							value={formData.remarks}
							onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
							className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium"
							placeholder="Any special instructions..."
						/>
					</div>

					<div className="flex gap-3 pt-2">
						<button type="button" onClick={onClose} className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all text-sm">Cancel</button>
						<button type="submit" disabled={loading} className="flex-[2] bg-slate-900 text-white font-bold py-3 rounded-2xl shadow-2xl shadow-slate-900/30 transition-all text-sm hover:bg-slate-800 disabled:bg-slate-400">
							{loading ? "Saving..." : "Confirm Schedule"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
