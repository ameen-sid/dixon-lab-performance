"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

type Product = { id: number; name: string; partNo: string | null };
type Supplier = { id: number; name: string };
type Equipment = { id: number; name: string; calibrationDueDate: string | null };
type Protocol = { id: number; testName: string; testPurpose: string | null; testMethod: string; judgementCriteria: string; productType: string };
type Station = { id: string; platformId: string; status: "AVAILABLE" | "OCCUPIED" };

const PRODUCT_TYPES = ["SATL", "FATL", "FAFL"];

export default function NewReliabilityCycle() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	// Master Data
	const [products, setProducts] = useState<Product[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [equipment, setEquipment] = useState<Equipment[]>([]);
	const [protocols, setProtocols] = useState<Protocol[]>([]);
	const [stations, setStations] = useState<Station[]>([]);

	const [form, setForm] = useState({
		partName: "",
		partNo: "",
		customerSupplier: "",
		testPurpose: "",
		sampleQuantity: "",
		testEquipment: "",
		startDate: "",
		endDate: "",
		reportIssueDate: "",
		calibrationDueDate: "",
		ambientTempHumidity: "",
		testPlace: "",
		standard: "",
		testMethod: "",
		judgementCriteria: "",
		productType: "SATL",
		nameOfTest: "",
	});

	const [selectedStations, setSelectedStations] = useState<string[]>([]);

	const fetchData = useCallback(async () => {
		try {
			const [pRes, sRes, eRes, protRes, stRes] = await Promise.all([
				fetch("/api/master-data/products"),
				fetch("/api/master-data/suppliers"),
				fetch("/api/master-data/testing-equipment"),
				fetch("/api/master-data/protocols"),
				fetch("/api/stations"),
			]);

			if (pRes.ok) setProducts(await pRes.json());
			if (sRes.ok) setSuppliers(await sRes.json());
			if (eRes.ok) setEquipment(await eRes.json());
			if (protRes.ok) setProtocols(await protRes.json());
			if (stRes.ok) setStations(await stRes.json());
		} catch (err) {
			console.error("Error fetching master data:", err);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Autofill Logic
	useEffect(() => {
		if (form.partName) {
			const prod = products.find((p) => p.name === form.partName);
			if (prod) setForm((prev) => ({ ...prev, partNo: prod.partNo || "N/A" }));
		}
	}, [form.partName, products]);

	useEffect(() => {
		if (form.nameOfTest) {
			// Find protocol matching both name AND product type
			const prot = protocols.find((p) => 
				p.testName === form.nameOfTest && 
				(p.productType || "").split(",").map(t => t.trim()).includes(form.productType)
			);
			if (prot) {
				setForm((prev) => ({
					...prev,
					testPurpose: prot.testPurpose || "",
					testMethod: prot.testMethod || "",
					judgementCriteria: prot.judgementCriteria || "",
				}));
			}
		}
	}, [form.nameOfTest, form.productType, protocols]);

	useEffect(() => {
		if (form.testEquipment) {
			const equip = equipment.find((e) => e.name === form.testEquipment);
			const calDate = equip?.calibrationDueDate;
			if (calDate) {
				setForm((prev) => ({
					...prev,
					calibrationDueDate: new Date(calDate).toISOString().split("T")[0],
				}));
			}
		}
	}, [form.testEquipment, equipment]);

	const handleChange = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setError("");
	};

	const toggleStation = (id: string, status: string) => {
		if (status === "OCCUPIED") return;
		setSelectedStations((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const required = [
			"partName",
			"customerSupplier",
			"sampleQuantity",
			"testEquipment",
			"startDate",
			"nameOfTest",
			"productType",
		];
		const missing = required.filter((f) => !form[f as keyof typeof form]);

		if (missing.length > 0) {
			setError(`Required fields missing: ${missing.join(", ")}`);
			return;
		}

		const qty = parseInt(form.sampleQuantity);
		if (selectedStations.length !== qty) {
			setError(`You must select exactly ${qty} stations for a sample quantity of ${qty}. (Currently ${selectedStations.length} selected)`);
			return;
		}

		setIsLoading(true);
		try {
			const res = await fetch("/api/reports/reliability", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					selectedStations,
				}),
			});

			if (res.ok) {
				setSuccess(true);
				setTimeout(() => router.push("/reports/reliability"), 1500);
			} else {
				const d = await res.json();
				setError(d.error || "Failed to start test.");
			}
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const sortedPlatforms = useMemo(() => {
		const groups: Record<string, Station[]> = {};
		stations.forEach((s) => {
			if (!groups[s.platformId]) groups[s.platformId] = [];
			groups[s.platformId].push(s);
		});
		
		return Object.entries(groups).map(([id, stns]) => ({
			id,
			stations: stns.sort((a, b) => {
				const aNum = parseInt(a.id.split("-S")[1]) || 0;
				const bNum = parseInt(b.id.split("-S")[1]) || 0;
				return aNum - bNum;
			})
		})).sort((a, b) => {
			const aNum = parseInt(a.id.replace(/\D/g, "")) || 0;
			const bNum = parseInt(b.id.replace(/\D/g, "")) || 0;
			return aNum - bNum;
		});
	}, [stations]);

	return (
		<div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="mb-8 flex justify-between items-end">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">New Reliability Cycle</h2>
					<p className="text-slate-500 mt-1 font-medium">Standardized registration with real-time station assignment.</p>
				</div>
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors mb-2"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
					</svg>
					Exit Form
				</button>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
					{/* Form Header */}
					<div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
						<h3 className="text-white font-semibold flex items-center gap-2">
							<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
							Cycle Registration
						</h3>
						<span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-3 py-1 rounded-full border border-blue-400/20 tracking-widest uppercase">
							SECURE INITIALIZATION
						</span>
					</div>

					<div className="p-8 space-y-10">
						{/* Feedback */}
						{error && (
							<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-center gap-2 font-medium animate-shake">
								<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{error}
							</div>
						)}
						{success && (
							<div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 flex items-center gap-2 font-medium">
								<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Initialization complete! Redirecting...
							</div>
						)}

						{/* --- Section 1: Identification --- */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
								<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
								Identification
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Part Name <span className="text-red-500">*</span></label>
									<select value={form.partName} onChange={(e) => handleChange("partName", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold appearance-none">
										<option value="">Select Part...</option>
										{products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Part Number <span className="text-slate-400 font-normal">(Auto)</span></label>
									<input type="text" value={form.partNo} readOnly className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-blue-600 font-bold text-sm" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Supplier / Customer <span className="text-red-500">*</span></label>
									<select value={form.customerSupplier} onChange={(e) => handleChange("customerSupplier", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold appearance-none">
										<option value="">Select Supplier...</option>
										{suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Sample Quantity <span className="text-red-500">*</span></label>
									<input type="number" min="1" value={form.sampleQuantity} onChange={(e) => handleChange("sampleQuantity", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold" placeholder="e.g. 10" />
								</div>
							</div>
						</div>

						<hr className="border-slate-50" />

						{/* --- Section 2: Test Protocol --- */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
								<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
								Test Parameters
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Product Type <span className="text-red-500">*</span></label>
									<div className="flex gap-2">
										{PRODUCT_TYPES.map(t => (
											<button
												key={t}
												type="button"
												onClick={() => setForm(prev => ({ ...prev, productType: t, nameOfTest: "" }))}
												className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${form.productType === t ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
											>
												{t}
											</button>
										))}
									</div>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Name of Test <span className="text-red-500">*</span></label>
									<select 
										value={form.nameOfTest} 
										onChange={(e) => handleChange("nameOfTest", e.target.value)} 
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold appearance-none"
									>
										<option value="">Select Test Category...</option>
										{protocols
											.filter(p => (p.productType || "").split(",").map(t => t.trim()).includes(form.productType))
											.map(p => <option key={p.id} value={p.testName}>{p.testName}</option>)}
									</select>
								</div>
							</div>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Test Purpose <span className="text-slate-400 font-normal">(Auto)</span></label>
									<textarea value={form.testPurpose} readOnly rows={2} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium resize-none" />
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Test Method <span className="text-slate-400 font-normal">(Auto-fill)</span></label>
										<textarea value={form.testMethod} readOnly rows={4} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 text-[11px] leading-relaxed font-medium resize-none" />
									</div>
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Judgement Criteria <span className="text-slate-400 font-normal">(Auto-fill)</span></label>
										<textarea value={form.judgementCriteria} readOnly rows={4} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 text-[11px] leading-relaxed font-medium resize-none" />
									</div>
								</div>
							</div>
						</div>

						<hr className="border-slate-50" />

						{/* --- Section 3: Logistics & Equipment --- */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
								<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
								Equipment & Environment
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Testing Equipment <span className="text-red-500">*</span></label>
									<select value={form.testEquipment} onChange={(e) => handleChange("testEquipment", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-semibold appearance-none">
										<option value="">Select Equipment...</option>
										{equipment.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Calibration Plan <span className="text-slate-400 font-normal">(Auto)</span></label>
									<input type="text" value={form.calibrationDueDate || "No date set"} readOnly className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 text-sm font-bold" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Lab Ambient (Temp/Hum)</label>
									<input type="text" value={form.ambientTempHumidity} onChange={(e) => handleChange("ambientTempHumidity", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="e.g. 25°C / 60% RH" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Test Location</label>
									<input type="text" value={form.testPlace} onChange={(e) => handleChange("testPlace", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="e.g. Reliability Lab #2" />
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Start Date <span className="text-red-500">*</span></label>
									<input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-bold text-slate-700" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">End Date</label>
									<input type="date" value={form.endDate} onChange={(e) => handleChange("endDate", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-bold text-slate-700" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Report Date</label>
									<input type="date" value={form.reportIssueDate} onChange={(e) => handleChange("reportIssueDate", e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs font-bold text-slate-700" />
								</div>
							</div>
						</div>

						<hr className="border-slate-50" />

						{/* --- Section 4: Station Selection --- */}
						<div>
							<div className="flex justify-between items-center mb-6">
								<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
									<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">4</span>
									Station Assignment
								</h4>
								<div className="bg-slate-900 px-4 py-2 rounded-2xl flex items-center gap-3">
									<div className="text-right">
										<p className="text-[8px] uppercase font-bold text-slate-500 tracking-widest">Selected Slots</p>
										<p className="text-lg font-black text-white leading-none tabular-nums">
											{selectedStations.length} <span className="text-slate-600 text-[10px]">/ {form.sampleQuantity || 0}</span>
										</p>
									</div>
									<div className={`w-3 h-3 rounded-full ${selectedStations.length === parseInt(form.sampleQuantity) && selectedStations.length > 0 ? "bg-emerald-500" : "bg-amber-500"}`} />
								</div>
							</div>

							<div className="space-y-6 max-h-[600px] overflow-y-auto p-4 bg-slate-100 rounded-[2.5rem] border border-slate-200 custom-scrollbar shadow-inner">
								{stations.length === 0 ? (
									<div className="py-20 text-center">
										<div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
										<p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Station Grid...</p>
									</div>
								) : (
									sortedPlatforms.map((platform) => (
										<div key={platform.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
											<div className="flex items-center justify-between mb-4">
												<h5 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
													<div className="w-2 h-4 bg-blue-600 rounded-full" />
													Platform {platform.id}
												</h5>
												<span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{platform.stations.filter(s => s.status === "AVAILABLE").length} Slots Free</span>
											</div>
											<div className="grid grid-cols-5 md:grid-cols-10 gap-2.5">
												{platform.stations.map((s) => {
													const isSelected = selectedStations.includes(s.id);
													const isOccupied = s.status === "OCCUPIED";
													return (
														<button
															key={s.id}
															type="button"
															disabled={isOccupied}
															onClick={() => toggleStation(s.id, s.status)}
															className={`
																aspect-square rounded-xl text-[10px] font-black transition-all flex flex-col items-center justify-center border-2
																${isOccupied ? "bg-slate-50 border-slate-100 text-slate-200 cursor-not-allowed opacity-40 shadow-none" : 
																  isSelected ? "bg-blue-600 border-blue-400 text-white scale-110 shadow-xl shadow-blue-500/30" : 
																  "bg-white border-slate-100 text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30"}
															`}
															title={isOccupied ? "Occupied" : `Station ${s.id}`}
														>
															<span>{s.id.split("-S")[1]}</span>
															{isOccupied && <div className="w-1 h-1 bg-rose-400 rounded-full mt-0.5" />}
														</button>
													);
												})}
											</div>
										</div>
									))
								)}
							</div>
						</div>

						{/* Submit Button */}
						<div className="pt-8 border-t border-slate-100 flex justify-end gap-3">
							<button
								type="button"
								onClick={() => router.back()}
								className="px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isLoading || success}
								className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 px-10 rounded-2xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
							>
								{isLoading ? (
									<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Initialing...</>
								) : (
									<>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
										Initialize Cycle
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
}

