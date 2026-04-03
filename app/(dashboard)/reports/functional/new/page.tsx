"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Supplier = { id: number; name: string; customer?: string | null };
type Product = { id: number; name: string };
type Protocol = { id: number; testName: string; productType: string; testPurpose: string; testMethod: string; judgementCriteria: string; testDuration: string };

const PRODUCT_TYPES = ["SATL", "FATL", "FAFL"];

export default function NewFunctionalTest() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [protocols, setProtocols] = useState<Protocol[]>([]);

	// Form state
	const [form, setForm] = useState({
		productPartName: "",
		companySupplier: "",
		customer: "", // [cite: master data enhancement]
		dateOfArrival: "",
		batchSlNo: "",
		productType: "",
		testName: "",
		model: "",
		samples: "",
		instrument: "",
		testPurpose: "",
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
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

	// Refs for camera and custom inputs
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

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
				const [suppRes, protoRes, prodRes] = await Promise.all([
					fetch("/api/master-data/suppliers"),
					fetch("/api/master-data/protocols"),
					fetch("/api/master-data/products"),
				]);
				if (suppRes.ok) setSuppliers(await suppRes.json());
				if (protoRes.ok) setProtocols(await protoRes.json());
				if (prodRes.ok) setProducts(await prodRes.json());
			} catch { /* silently fail */ }
		};
		load();
	}, []);

	const set = (field: string, value: any) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setError("");
	};

	const handleSupplierChange = (supplierName: string) => {
		set("companySupplier", supplierName);
		const supplier = suppliers.find((s) => s.name === supplierName);
		if (supplier && supplier.customer) {
			set("customer", supplier.customer);
		} else {
			set("customer", "");
		}
	};

	// Auto-fill from protocol when test name selected
	const handleTestNameSelect = (name: string) => {
		set("testName", name);
		const proto = protocols.find((p) =>
			(p.testName === name || p.testName.startsWith(name)) &&
			(p.productType || "").split(",").map(t => t.trim()).includes(form.productType),
		);
		if (proto) {
			setForm((prev) => ({
				...prev,
				testName: name,
				testPurpose: proto.testPurpose || prev.testPurpose,
				testMethod: proto.testMethod || prev.testMethod,
				judgementCriteria: proto.judgementCriteria || prev.judgementCriteria,
				testDuration: proto.testDuration || prev.testDuration,
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

	// --- Camera Functions ---
	const openCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
				audio: false,
			});
			setCameraStream(stream);
			setIsCameraOpen(true);
			if (videoRef.current) videoRef.current.srcObject = stream;
		} catch (err) {
			console.error("Camera access denied:", err);
			setError("Camera access denied. Please check site permissions.");
		}
	};

	const capturePhoto = () => {
		if (videoRef.current && canvasRef.current) {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;
			const ctx = canvas.getContext("2d");
			if (ctx) {
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => {
					if (blob) {
						const file = new File([blob], `snap-${Date.now()}.jpg`, { type: "image/jpeg" });
						if (images.length < 5) {
							const newFiles = [...images, file];
							setImages(newFiles);
							setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
						} else {
							setError("Maximum 5 images allowed.");
						}
						closeCamera();
					}
				}, "image/jpeg", 0.9);
			}
		}
	};

	const closeCamera = () => {
		if (cameraStream) {
			cameraStream.getTracks().forEach((track) => track.stop());
		}
		setCameraStream(null);
		setIsCameraOpen(false);
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
									<select value={form.productPartName} onChange={(e) => set("productPartName", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none">
										<option value="">Select product / part...</option>
										{products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Company / Supplier <span className="text-red-500">*</span></label>
									<select value={form.companySupplier} onChange={(e) => handleSupplierChange(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none">
										<option value="">Select supplier...</option>
										{suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Customer</label>
									<input type="text" value={form.customer} onChange={(e) => set("customer", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm focus:bg-blue-50/50" placeholder="Auto-filled from supplier..." />
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
									<input type="number" min="0" value={form.samples} onChange={(e) => set("samples", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. 1" />
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
									{!form.productType ? (
										<p className="text-xs text-slate-400 italic mt-2 ml-1">Please select Product Type first...</p>
									) : (
										<div className="flex flex-wrap gap-2">
											{protocols
												.filter((p) => (p.productType || "").split(",").map(t => t.trim()).includes(form.productType))
												.map((p) => (
													<label key={p.id} className="relative cursor-pointer">
														<input type="radio" name="testName" value={p.testName} checked={form.testName === p.testName} onChange={() => { handleTestNameSelect(p.testName); setCustomTestName(""); }} className="peer absolute opacity-0 w-0 h-0" />
														<div className="px-4 py-2.5 border border-slate-200 rounded-xl peer-checked:bg-indigo-50 peer-checked:border-indigo-500 peer-checked:text-indigo-700 font-bold text-slate-400 transition-all hover:bg-slate-50 text-sm">
															{p.testName}
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
									)}
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
										Test Purpose
										{form.testName && <span className="ml-2 text-xs text-blue-500 font-medium">(auto-filled from protocol)</span>}
									</label>
									<textarea rows={3} value={form.testPurpose} onChange={(e) => set("testPurpose", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Verify structural integrity..." />
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

								{/* Image Capture */}
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">
										Evidence Photos <span className="text-slate-400 font-normal">(up to 5)</span>
									</label>
									<div>
										<button
											type="button"
											onClick={openCamera}
											className="w-full relative overflow-hidden border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm bg-gradient-to-b from-slate-50 to-white"
										>
											<div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md text-slate-400 group-hover:text-blue-600 transition-all mb-3 group-hover:scale-110 border border-slate-100">
												<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
											</div>
											<p className="text-sm font-extrabold text-slate-800 tracking-tight">Snap Evidence Photo</p>
											<p className="text-xs text-slate-400 mt-1 font-medium italic underline underline-offset-4 decoration-blue-200">opens camera viewfinder</p>
										</button>
										<p className="text-[10px] text-slate-400 mt-2 ml-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											Camera Optimized
										</p>
									</div>

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

			{isCameraOpen && (
				<CameraOverlay
					videoRef={videoRef}
					stream={cameraStream}
					onCapture={capturePhoto}
					onClose={closeCamera}
				/>
			)}

			<canvas ref={canvasRef} style={{ display: "none" }} />
		</div>
	);
}

// Camera Overlay Component
function CameraOverlay({ videoRef, stream, onCapture, onClose }: { videoRef: any; stream: MediaStream | null; onCapture: () => void; onClose: () => void }) {
	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
		}
	}, [videoRef, stream]);

	return (
		<div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-300">
			{/* Top Bar */}
			<div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-10">
				<div className="flex items-center gap-3">
					<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
					<span className="text-white font-bold tracking-widest text-xs uppercase">Live Viewfinder</span>
				</div>
				<button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{/* Viewfinder */}
			<div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-900">
				{!stream && (
					<div className="text-white text-center p-6">
						<div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
						<p className="text-sm font-medium opacity-60">Initializing camera...</p>
					</div>
				)}
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					className={`h-full w-full object-cover transition-opacity duration-700 ${stream ? "opacity-100" : "opacity-0"}`}
				/>
				{/* Crop Guide */}
				<div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none flex items-center justify-center">
					<div className="w-full h-full border border-white/30 rounded-3xl" />
				</div>
			</div>

			{/* Controls */}
			<div className="p-10 bg-gradient-to-t from-black to-transparent flex justify-center items-center gap-12">
				<button
					onClick={onCapture}
					disabled={!stream}
					className="w-20 h-20 bg-white rounded-full p-1 shadow-2xl active:scale-95 transition-all outline outline-4 outline-white/20 outline-offset-4 group disabled:opacity-50 disabled:scale-90"
				>
					<div className="w-full h-full rounded-full border-2 border-black/5 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
						<svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
				</button>
			</div>

			{/* Invisible Canvas for Capture */}
			<canvas id="hidden-capture-canvas" style={{ display: "none" }} />
		</div>
	);
}
