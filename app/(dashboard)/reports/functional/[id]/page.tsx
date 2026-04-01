"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";

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
	samples: string;
	instrument: string;
	testPurpose: string;
	testCondition: string;
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
	return new Date(d).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function SectionHeading({ num, title }: { num: string; title: string }) {
	return (
		<h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
			<span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
				{num}
			</span>
			{title}
		</h4>
	);
}

function DataField({ label, value, isBadge, isSuccess }: { label: string; value: string; isBadge?: boolean; isSuccess?: boolean }) {
	return (
		<div>
			<label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
				{label}
			</label>
			{isBadge ? (
				<span
					className={`inline-flex items-center px-3 py-1.5 rounded-xl font-bold text-sm border ${
						isSuccess
							? "bg-emerald-50 text-emerald-700 border-emerald-200"
							: isSuccess === false
							? "bg-red-50 text-red-700 border-red-200"
							: "bg-blue-50 text-blue-700 border-blue-200"
					}`}
				>
					{value}
				</span>
			) : (
				<div className="text-sm font-medium text-slate-800 bg-slate-50/50 px-4 py-3 rounded-xl border border-slate-100">
					{value || <span className="text-slate-400 italic">Not specified</span>}
				</div>
			)}
		</div>
	);
}

export default function FunctionalTestDetails({ params }: { params: Promise<{ id: string }> }) {
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
				<p className="mt-4 text-slate-500 font-bold">Loading test details...</p>
			</div>
		);
	}

	if (!test) return null;

	return (
		<div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="mb-8 flex flex-wrap items-center justify-between gap-4">
				<div>
					<Link href="/reports/functional" className="text-blue-600 font-semibold text-sm hover:underline mb-2 inline-flex items-center gap-1">
						← Back to History
					</Link>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
						Test Report PTR-{test.id.toString().padStart(4, "0")}
						<span
							className={`text-sm font-black px-3 py-1 rounded-full border ${
								test.isPass ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
							}`}
						>
							{test.isPass ? "PASS" : "FAIL"}
						</span>
					</h2>
					<p className="text-slate-500 mt-1 font-medium pb-2">
						Logged on {formatDate(test.createdAt)}
					</p>
				</div>
				<button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" />
					</svg>
					Print Report
				</button>
			</div>

			<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 space-y-10">
				{/* Basic Info */}
				<div>
					<SectionHeading num="1" title="Basic Information" />
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<DataField label="Part Name" value={test.productPartName} />
						<DataField label="Supplier" value={test.companySupplier} />
						<DataField label="Date of Arrival" value={formatDate(test.dateOfArrival)} />
						<DataField label="Batch / Serial No." value={test.batchSlNo} />
						<DataField label="Model" value={test.model} />
						<DataField label="Samples Tested" value={test.samples} />
					</div>
				</div>

				<hr className="border-slate-100" />

				{/* Categorization */}
				<div>
					<SectionHeading num="2" title="Categorization" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<DataField label="Product Type" value={test.productType} isBadge />
						<DataField label="Name of Test" value={test.testName} isBadge />
					</div>
				</div>

				<hr className="border-slate-100" />

				{/* Details */}
				<div>
					<SectionHeading num="3" title="Test Details" />
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<DataField label="Instrument Used" value={test.instrument} />
						<DataField label="Test Purpose" value={test.testPurpose} />
						<div className="lg:col-span-2">
							<DataField label="Test Condition" value={test.testCondition} />
						</div>
						<div className="lg:col-span-2">
							<DataField label="Method / Conditions" value={test.testMethod} />
						</div>
						<div className="lg:col-span-2">
							<DataField label="Judgement Criteria" value={test.judgementCriteria} />
						</div>
						<div className="lg:col-span-2">
							<DataField label="Test Observation" value={test.testObservation} />
						</div>
					</div>
				</div>

				<hr className="border-slate-100" />

				{/* Schedule */}
				<div>
					<SectionHeading num="4" title="Test Schedule" />
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
						<DataField label="Started On" value={formatDate(test.testStartDate)} />
						<DataField label="Ended On" value={formatDate(test.testEndDate)} />
						<DataField label="Total Duration" value={test.testDuration} />
					</div>
				</div>

				{/* Evidence */}
				{test.images && test.images.length > 0 && (
					<>
						<hr className="border-slate-100" />
						<div>
							<SectionHeading num="5" title="Evidence & Photos" />
							<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
								{test.images.map((img) => (
									<a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl border border-slate-200 aspect-[4/3]">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={img.imageUrl} alt="Evidence" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
											<span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm transition-all shadow-xl font-bold">
												View Full Size
											</span>
										</div>
									</a>
								))}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
