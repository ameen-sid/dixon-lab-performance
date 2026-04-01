"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Supplier = { id: number; name: string };
type Protocol = { id: number; testName: string; testCondition: string; testMethod: string; judgementCriteria: string };

const PRODUCT_TYPES = ["SATL", "FATL", "FAFL"];
const TEST_NAMES = ["TR", "CR", "CD", "BD"];

export default function NewFunctionalTest() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [protocols, setProtocols] = useState<Protocol[]>([]);

	// Form state
	const [form, setForm] = useState({
		productPartName: "",
		companySupplier: "",
		dateOfArrival: "",
		batchSlNo: "",
		productType: "",
		testName: "",
		model: "",
		samples: "",
		instrument: "",
		testPurpose: "",
		testCondition: "",
		testMethod: "",
		judgementCriteria: "",
		testObservation: "",
		isPass: "" as "" | "true" | "false",
		testStartDate: "",
		testEndDate: "",
		testDuration: "",
	});

	const [images, setImages] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);

	// "Other" free-text state
	const [customProductType, setCustomProductType] = useState("");
	const [customTestName, setCustomTestName] = useState("");

	// Refs for custom inputs — focus without scrolling
	const customProductTypeRef = useRef<HTMLInputElement>(null);
	const customTestNameRef = useRef<HTMLInputElement>(null);

	// Focus custom input without causing page scroll
	useEffect(() => {
		if (form.productType === "OTHER" && customProductTypeRef.current) {
			customProductTypeRef.current.focus({ preventScroll: true });
		}
	}, [form.productType]);

	useEffect(() => {
		if (form.testName === "OTHER" && customTestNameRef.current) {
			customTestNameRef.current.focus({ preventScroll: true });
		}
	}, [form.testName]);

	useEffect(() => {
		const load = async () => {
			try {
				const [suppRes, protoRes] = await Promise.all([
					fetch("/api/master-data/suppliers"),
					fetch("/api/master-data/protocols"),
				]);
				if (suppRes.ok) setSuppliers(await suppRes.json());
				if (protoRes.ok) setProtocols(await protoRes.json());
			} catch { /* silently fail */ }
		};
		load();
	}, []);

	const set = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setError("");
	};

	// Auto-fill from protocol when test name selected
	const handleTestNameSelect = (name: string) => {
		set("testName", name);
		const proto = protocols.find((p) => p.testName === name || p.testName.startsWith(name));
		if (proto) {
			setForm((prev) => ({
				...prev,
				testName: name,
				testCondition: proto.testCondition || prev.testCondition,
				testMethod: proto.testMethod || prev.testMethod,
				judgementCriteria: proto.judgementCriteria || prev.judgementCriteria,
			}));
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length + images.length > 5) {
			setError("Maximum 5 images allowed.");
			return;
		}
		const newFiles = [...images, ...files];
		setImages(newFiles);
		setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
	};

	const removeImage = (idx: number) => {
		const newFiles = images.filter((_, i) => i !== idx);
		setImages(newFiles);
		setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		// Validation
		if (!form.productPartName || !form.companySupplier || !form.dateOfArrival || !form.batchSlNo) {
			setError("Please fill in all required basic info fields.");
			return;
		}
		if (!form.productType) { setError("Please select a Product Type."); return; }
		if (form.productType === "OTHER" && !customProductType.trim()) { setError("Please enter a custom Product Type."); return; }
		if (!form.testName) { setError("Please select a Test Name."); return; }
		if (form.testName === "OTHER" && !customTestName.trim()) { setError("Please enter a custom Test Name."); return; }
		if (!form.testMethod || !form.judgementCriteria || !form.testObservation) {
			setError("Test Method, Judgement Criteria, and Test Observation are required."); return;
		}
		if (form.isPass === "") { setError("Please select the Final Test Result (PASS or FAIL)."); return; }
		if (!form.testStartDate || !form.testEndDate) { setError("Test Start and End dates are required."); return; }

		setIsLoading(true);
		try {
			// Step 1: Create the functional test record
			const res = await fetch("/api/reports/functional", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					// Resolve "OTHER" to the typed custom value before saving
					productType: form.productType === "OTHER" ? customProductType.trim() : form.productType,
					testName: form.testName === "OTHER" ? customTestName.trim() : form.testName,
					isPass: form.isPass === "true",
					dateOfArrival: new Date(form.dateOfArrival).toISOString(),
					testStartDate: new Date(form.testStartDate).toISOString(),
					testEndDate: new Date(form.testEndDate).toISOString(),
				}),
			});

			if (!res.ok) {
				const d = await res.json();
				setError(d.error || "Failed to save report.");
				setIsLoading(false);
				return;
			}

			const newTest = await res.json();

			// Step 2: Upload images if any
			if (images.length > 0) {
				for (const img of images) {
					const fd = new FormData();
					fd.append("file", img);
					fd.append("functionalTestId", String(newTest.id));
					await fetch("/api/upload", { method: "POST", body: fd });
				}
			}

			setSuccess(true);
			setTimeout(() => router.push("/reports/functional"), 1500);
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
					New Functional Test
				</h2>
				<p className="text-slate-500 mt-1 font-medium">
					Log a new single-event QA inspection report.
				</p>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
					{/* Form Header */}
					<div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
						<h3 className="text-white font-semibold flex items-center gap-2">
							<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
							</svg>
							Test Parameters
						</h3>
						<span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/20">
							NEW REPORT
						</span>
					</div>

					<div className="p-8 space-y-8">
						{/* Error / Success */}
						{error && (
							<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 flex items-center gap-2 font-medium">
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
								Report saved! Redirecting...
							</div>
						)}

						{/* ─── Section 1: Basic Info ─── */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
								<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
								Basic Information
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Product / Part Name <span className="text-red-500">*</span></label>
									<input type="text" value={form.productPartName} onChange={(e) => set("productPartName", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. MODIFIED TUB AT CLASP AREA" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Company / Supplier <span className="text-red-500">*</span></label>
									<select value={form.companySupplier} onChange={(e) => set("companySupplier", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none">
										<option value="">Select supplier...</option>
										{suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Date of Arrival <span className="text-red-500">*</span></label>
									<input type="date" value={form.dateOfArrival} onChange={(e) => set("dateOfArrival", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Batch / Serial No. <span className="text-red-500">*</span></label>
									<input type="text" value={form.batchSlNo} onChange={(e) => set("batchSlNo", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Batch-2026-001" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Model</label>
									<input type="text" value={form.model} onChange={(e) => set("model", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. RIL, P1-UI-1.5, 8.5kg" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Samples</label>
									<input type="text" value={form.samples} onChange={(e) => set("samples", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. 1 sample" />
								</div>
							</div>
						</div>

						<hr className="border-slate-100" />

						{/* ─── Section 2: Categorization ─── */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
								<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
								Categorization
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">Product Type <span className="text-red-500">*</span></label>
									<div className="flex flex-wrap gap-2">
										{PRODUCT_TYPES.map((type) => (
											<label key={type} className="relative cursor-pointer">
												<input type="radio" name="productType" value={type} checked={form.productType === type} onChange={() => { set("productType", type); setCustomProductType(""); }} className="peer absolute opacity-0 w-0 h-0" />
												<div className="px-4 py-2.5 border border-slate-200 rounded-xl peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700 font-bold text-slate-400 transition-all hover:bg-slate-50 text-sm">
													{type}
												</div>
											</label>
										))}
										{/* Other option */}
										<label className="relative cursor-pointer">
											<input type="radio" name="productType" value="OTHER" checked={form.productType === "OTHER"} onChange={() => set("productType", "OTHER")} className="peer absolute opacity-0 w-0 h-0" />
											<div className="px-4 py-2.5 border border-slate-200 rounded-xl peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700 font-bold text-slate-400 transition-all hover:bg-slate-50 text-sm flex items-center gap-1.5">
												<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
												Other
											</div>
										</label>
									</div>
									{/* Reveal custom input when Other selected */}
									{form.productType === "OTHER" && (
										<div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
											<input
												ref={customProductTypeRef}
												type="text"
												value={customProductType}
												onChange={(e) => setCustomProductType(e.target.value)}
												className="w-full px-4 py-2.5 bg-amber-50 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-amber-400"
												placeholder="Type custom product type..."
											/>
										</div>
									)}
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">Name of Test <span className="text-red-500">*</span></label>
									<div className="flex flex-wrap gap-2">
										{TEST_NAMES.map((test) => (
											<label key={test} className="relative cursor-pointer">
												<input type="radio" name="testName" value={test} checked={form.testName === test} onChange={() => { handleTestNameSelect(test); setCustomTestName(""); }} className="peer absolute opacity-0 w-0 h-0" />
												<div className="px-4 py-2.5 border border-slate-200 rounded-xl peer-checked:bg-indigo-50 peer-checked:border-indigo-500 peer-checked:text-indigo-700 font-bold text-slate-400 transition-all hover:bg-slate-50 text-sm">
													{test}
												</div>
											</label>
										))}
										{/* Other option */}
										<label className="relative cursor-pointer">
											<input type="radio" name="testName" value="OTHER" checked={form.testName === "OTHER"} onChange={() => { set("testName", "OTHER"); setCustomTestName(""); }} className="peer absolute opacity-0 w-0 h-0" />
											<div className="px-4 py-2.5 border border-slate-200 rounded-xl peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700 font-bold text-slate-400 transition-all hover:bg-slate-50 text-sm flex items-center gap-1.5">
												<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
												Other
											</div>
										</label>
									</div>
									{/* Reveal custom input when Other selected */}
									{form.testName === "OTHER" && (
										<div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
											<input
												ref={customTestNameRef}
												type="text"
												value={customTestName}
												onChange={(e) => setCustomTestName(e.target.value)}
												className="w-full px-4 py-2.5 bg-amber-50 border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400/20 focus:border-amber-500 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-amber-400"
												placeholder="Type custom test name..."
											/>
										</div>
									)}
								</div>
							</div>
						</div>

						<hr className="border-slate-100" />

						{/* ─── Section 3: Test Details ─── */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
								<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
								Test Details
							</h4>
							<div className="space-y-5">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Instrument</label>
										<input type="text" value={form.instrument} onChange={(e) => set("instrument", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Power Meter, AC Power" />
									</div>
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Test Purpose</label>
										<input type="text" value={form.testPurpose} onChange={(e) => set("testPurpose", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Verify thermal limits" />
									</div>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
										Test Condition
										{form.testName && <span className="ml-2 text-xs text-blue-500 font-medium">(auto-filled from protocol)</span>}
									</label>
									<textarea rows={3} value={form.testCondition} onChange={(e) => set("testCondition", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Keep Voltage 245V, 50Hz..." />
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
											Test Method / Conditions <span className="text-red-500">*</span>
										</label>
										<textarea rows={4} value={form.testMethod} onChange={(e) => set("testMethod", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Enter voltage conditions, load details..." />
									</div>
									<div>
										<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
											Judgement Criteria <span className="text-red-500">*</span>
										</label>
										<textarea rows={4} value={form.judgementCriteria} onChange={(e) => set("judgementCriteria", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. No abnormality, damage..." />
									</div>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Test Observation <span className="text-red-500">*</span></label>
									<textarea rows={3} value={form.testObservation} onChange={(e) => set("testObservation", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="Enter actual results observed during testing..." />
								</div>
							</div>
						</div>

						<hr className="border-slate-100" />

						{/* ─── Section 4: Schedule ─── */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
								<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">4</span>
								Test Schedule
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Start Date <span className="text-red-500">*</span></label>
									<input type="date" value={form.testStartDate} onChange={(e) => set("testStartDate", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">End Date <span className="text-red-500">*</span></label>
									<input type="date" value={form.testEndDate} onChange={(e) => set("testEndDate", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Duration</label>
									<input type="text" value={form.testDuration} onChange={(e) => set("testDuration", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. 4 Hours" />
								</div>
							</div>
						</div>

						<hr className="border-slate-100" />

						{/* ─── Section 5: Result & Evidence ─── */}
						<div>
							<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
								<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">5</span>
								Result & Evidence
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
								{/* Pass/Fail Toggle */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">
										Final Test Result <span className="text-red-500">*</span>
									</label>
									<div className="flex gap-4">
										<label className="relative flex-1 cursor-pointer">
											<input type="radio" name="result" value="true" checked={form.isPass === "true"} onChange={() => set("isPass", "true")} className="peer absolute opacity-0 w-0 h-0" />
											<div className="text-center px-4 py-5 border-2 border-slate-200 rounded-xl peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-700 font-black text-slate-300 transition-all hover:bg-slate-50 text-lg">
												✅ PASS
											</div>
										</label>
										<label className="relative flex-1 cursor-pointer">
											<input type="radio" name="result" value="false" checked={form.isPass === "false"} onChange={() => set("isPass", "false")} className="peer absolute opacity-0 w-0 h-0" />
											<div className="text-center px-4 py-5 border-2 border-slate-200 rounded-xl peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 font-black text-slate-300 transition-all hover:bg-slate-50 text-lg">
												❌ FAIL
											</div>
										</label>
									</div>
								</div>

								{/* Image Upload */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">
										Evidence Photos <span className="text-slate-400 font-normal">(up to 5)</span>
									</label>
									<label className="relative overflow-hidden border-2 border-dashed border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer group">
										<input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
										<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-500 mb-2">
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
										</div>
										<p className="text-sm font-medium text-slate-600">Click to upload photos</p>
										<p className="text-xs text-slate-400 mt-0.5">PNG, JPG up to 10MB each</p>
									</label>
									{imagePreviews.length > 0 && (
										<div className="grid grid-cols-3 gap-2 mt-3">
											{imagePreviews.map((src, i) => (
												<div key={i} className="relative group/img">
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img src={src} alt={`preview-${i}`} className="w-full h-20 object-cover rounded-xl border border-slate-200" />
													<button
														type="button"
														onClick={() => removeImage(i)}
														className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
													>×</button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Submit */}
						<div className="pt-4 flex justify-end gap-3">
							<button
								type="button"
								onClick={() => router.back()}
								className="px-6 py-3 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isLoading || success}
								className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
							>
								{isLoading ? (
									<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
								) : (
									<>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										Save Test Report
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
