"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Image = { id: number; imageUrl: string };

type TestDetails = {
	id: number;
	productPartName: string;
	companySupplier: string;
	dateOfArrival: string;
	batchSlNo: string;
	productType: string;
	testName: string;
	model: string;
	samples: number | string;
	instrument: string;
	testPurpose: string;
	testMethod: string;
	judgementCriteria: string;
	testObservation: string;
	isPass: boolean;
	testStartDate: string;
	testEndDate: string;
	testDuration: string;
	createdAt: string;
	images: Image[];
};

function formatDate(d: string) {
	if (!d) return "-";
	const date = new Date(d);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

export default function FunctionalTestReport({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter();
	const resolvedParams = use(params);
	const testId = resolvedParams.id;

	const [test, setTest] = useState<TestDetails | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch(`/api/reports/functional/${testId}`);
				if (res.ok) {
					setTest(await res.json());
				} else {
					router.push("/reports/functional");
				}
			} catch {
				router.push("/reports/functional");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [testId, router]);

	if (loading) {
		return (
			<div className="max-w-5xl mx-auto flex flex-col items-center justify-center py-20 animate-pulse">
				<div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
				<p className="mt-4 text-slate-500 font-bold tracking-tight">Generating Precision Report...</p>
			</div>
		);
	}

	if (!test) return null;

	return (
		<div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-700 print:max-w-none print:p-0 print:m-0">
			{/* Action Header - Hidden on Print */}
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden px-4">
				<Link href="/reports/functional" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
					← Back to History
				</Link>
				<button 
					onClick={() => window.print()} 
					className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" />
					</svg>
					Print Professional Report
				</button>
			</div>

			{/* --- THE PROFESSIONAL REPORT (TABLE BASED) --- */}
			<div className="bg-white p-6 md:p-10 shadow-2xl rounded-[40px] border border-slate-100 print:shadow-none print:border-none print:p-0 print:text-black">
				
				{/* Top Branding Header */}
				<div className="flex justify-between items-start mb-6 print:mb-4">
					<h1 className="text-2xl font-black text-slate-900 print:text-black leading-tight max-w-[60%]">
						{test.testName} Test Report:-
					</h1>
					<div className="text-right">
						<img src="/logo.png" alt="Dixon Logo" className="h-10 w-auto object-contain ml-auto" />
						<p className="text-[10px] font-black text-slate-400 print:text-slate-500 uppercase tracking-widest mt-1">
							The brand behind brands
						</p>
					</div>
				</div>

				{/* Info Table Redesign using <table> for absolute precision */}
				<div className="w-full">
					<table className="w-full border-collapse border-[1.5px] border-slate-800 text-[11px] font-bold">
						<colgroup>
							<col className="w-[15%]" />
							<col className="w-[20%]" />
							<col className="w-[10%]" />
							<col className="w-[12%]" />
							<col className="w-[10%]" />
							<col className="w-[23%]" />
							<col className="w-[10%]" />
						</colgroup>
						<tbody>
							<tr>
								<td className="bg-slate-100 p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 print:bg-slate-100">Model</td>
								<td className="p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 text-slate-700 print:text-black">{test.model || "-"}</td>
								<td className="bg-slate-100 p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 print:bg-slate-100">Test Date</td>
								<td className="p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 text-slate-700 print:text-black text-center">{formatDate(test.testStartDate)}</td>
								<td className="bg-slate-100 p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 print:bg-slate-100">Test Place</td>
								<td className="p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 text-slate-700 print:text-black">Dixon Product Evaluation Lab</td>
								<td className="bg-slate-100 p-2 border-b-[1.5px] border-slate-800 text-center uppercase tracking-widest print:bg-slate-100">Result</td>
							</tr>
							<tr>
								<td className="bg-slate-100 p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 print:bg-slate-100">Test condition</td>
								<td colSpan={3} className="p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 text-slate-500 print:text-slate-700 font-medium italic">Refer Below Method Test Conditions.</td>
								<td className="bg-slate-100 p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 print:bg-slate-100">Samples</td>
								<td className="p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 text-slate-700 print:text-black text-center">{test.samples} sample</td>
								<td rowSpan={2} className={`p-2 border-b-[1.5px] border-slate-800 text-center text-xl font-black ${test.isPass ? 'text-emerald-600' : 'text-red-600'}`}>
									{test.isPass ? 'PASS' : 'FAIL'}
								</td>
							</tr>
							<tr>
								<td className="bg-slate-100 p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 print:bg-slate-100">STD</td>
								<td colSpan={3} className="p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 text-slate-700 print:text-black font-medium text-center">As per product standard</td>
								<td className="bg-slate-100 p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 print:bg-slate-100 whitespace-nowrap">Instrument</td>
								<td className="p-2 border-r-[1.5px] border-b-[1.5px] border-slate-800 text-slate-700 print:text-black text-center text-[10px]">{test.instrument || "-"}</td>
							</tr>
							<tr>
								<td className="bg-slate-100 p-2 border-r-[1.5px] border-slate-800 print:bg-slate-100">Test purpose</td>
								<td colSpan={6} className="p-2 text-slate-800 print:text-black font-medium uppercase tracking-tighter leading-tight text-[10px]">
									{test.testPurpose || "-"}
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				{/* Main Content Body (Grid but with rigid borders) */}
				<div className="grid grid-cols-2 border-x-[1.5px] border-b-[1.5px] border-slate-800 min-h-[480px]">
					
					{/* Left Column: Method & Criteria */}
					<div className="border-r-[1.5px] border-slate-800 flex flex-col">
						<div className="bg-slate-100 p-2 text-center text-xs font-black uppercase tracking-widest border-b-[1.5px] border-black print:bg-slate-100">
							TEST METHOD
						</div>
						<div className="p-4 flex-1">
							<div className="text-[11px] leading-relaxed whitespace-pre-wrap font-medium text-slate-800 print:text-black">
								{test.testMethod}
							</div>
						</div>
						
						<div className="bg-slate-100 p-2 text-center text-xs font-black uppercase tracking-widest border-y-[1.5px] border-black print:bg-slate-100">
							JUDGE CRITERIA
						</div>
						<div className="p-4 h-[160px]">
							<div className="text-[11px] leading-relaxed whitespace-pre-wrap font-medium text-slate-800 print:text-black italic">
								{test.judgementCriteria?.split('\n').map((line, i) => (
									<div key={i} className="mb-1 flex gap-2">
										<span>*</span>
										<span>{line}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Right Column: Evidence & Results */}
					<div className="flex flex-col">
						<div className="bg-slate-100 p-2 text-center text-xs font-black uppercase tracking-widest border-b-[1.5px] border-black print:bg-slate-100">
							TEST RESULTS
						</div>
						<div className="p-4 flex-1">
							<h5 className="text-xs font-bold underline mb-3 text-slate-800 print:text-black">Test Image:-</h5>
							
							{/* Evidence Grid */}
							<div className="grid grid-cols-2 gap-2 mb-6">
								{test.images.map((img) => (
									<div key={img.id} className="border-[1px] border-slate-800 rounded overflow-hidden shadow-sm bg-white">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={img.imageUrl} alt="Evidence" className="w-full aspect-[4/3] object-contain bg-slate-50" />
									</div>
								))}
								{test.images.length === 0 && (
									<div className="col-span-2 h-24 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-300 font-bold italic text-xs text-center">
										No images captured <br/> for this report
									</div>
								)}
							</div>

							{/* Observation Text */}
							<div className="mt-auto pt-4 border-t border-slate-800 text-[11px] leading-relaxed font-bold text-slate-900 print:text-black italic">
								{test.testObservation}
							</div>
						</div>
					</div>

				</div>

				{/* Footer Info / Signatures Placeholder */}
				<div className="mt-3 flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400 print:text-slate-500">
					<span>INTERNAL DOCUMENT // DIXON EVALUATION LAB // CONFIDENTIAL</span>
					<span>REPORT GEN: {new Date().toISOString()}</span>
				</div>
			</div>
			
			<style jsx global>{`
				@media print {
					@page { margin: 0.5cm; size: A4; }
					body { background: white !important; margin: 0; padding: 0; }
					.print\\:hidden { display: none !important; }
					* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
				}
			`}</style>
		</div>
	);
}
