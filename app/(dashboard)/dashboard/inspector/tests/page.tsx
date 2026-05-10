"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";

type Test = {
	id: number;
	testProtocol: { name: string; productType: string };
	testType: { name: string };
	testCategory: { name: string };
	startDate: string;
	endDate: string;
	status: string;
	stationIds: string | null;
};

export default function InspectorTestsPage() {
	const [tests, setTests] = useState<Test[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchTests = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/inspector/tests");
			if (res.ok) setTests(await res.json());
		} catch { /* fail */ }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { fetchTests(); }, [fetchTests]);

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Test Queue</h2>
				<p className="text-slate-500 mt-1 font-medium">Daily checksheet management for ongoing reliability tests.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{loading ? (
					Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 animate-pulse" />
					))
				) : tests.length === 0 ? (
					<div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200">
						<p className="text-slate-400 font-bold">No active tests for today.</p>
					</div>
				) : (
					tests.map((test) => (
						<Link 
							key={test.id} 
							href={`/dashboard/inspector/checksheet/${test.id}`}
							className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-200/50 transition-all group flex flex-col justify-between"
						>
							<div>
								<div className="flex justify-between items-start mb-4">
									<div className="flex flex-col">
										<span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{test.testType.name}</span>
										<h3 className="text-xl font-bold text-slate-900 mt-1 leading-tight">{test.testProtocol.name}</h3>
									</div>
									<div className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase">
										{test.testProtocol.productType}
									</div>
								</div>

								<div className="space-y-2 mt-4">
									<div className="flex items-center gap-2 text-xs font-bold text-slate-500">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										Stations: {test.stationIds || "N/A"}
									</div>
									<div className="flex items-center gap-2 text-xs font-bold text-slate-500">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										Ends on: {format(new Date(test.endDate), "dd MMM yyyy")}
									</div>
								</div>
							</div>

							<div className="mt-8 flex items-center justify-between">
								<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Checksheet</span>
								<div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</div>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
