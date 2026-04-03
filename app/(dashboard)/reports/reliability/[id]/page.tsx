"use client";

import { useState, useEffect, useCallback, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type DailyLog = {
	id: number;
	logDate: string;
	cycleCount: number | null;
	pcb: string | null;
	feedValve: string | null;
	washMotor: string | null;
	clutch: string | null;
	errorDetail: string | null;
	otherIssues: string | null;
	remarks: string | null;
};

type ReliabilityTest = {
	id: number;
	modelCap: string;
	partName: string;
	vendor: string;
	clothLoad: string;
	startDate: string;
	status: string;
	dailyLogs: DailyLog[];
};

function formatDateExcel(d: string | Date) {
	if (!d) return "-";
	const date = new Date(d);
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}-${month}-${year}`;
}

export default function ReliabilityChronologySheet({ params }: { params: Promise<{ id: string }> }) {
	const router = useRouter();
	const resolvedParams = use(params);
	const testId = resolvedParams.id;

	const [test, setTest] = useState<ReliabilityTest | null>(null);
	const [loading, setLoading] = useState(true);
	const [savingField, setSavingField] = useState<string | null>(null);

	const fetchTest = useCallback(async () => {
		try {
			const res = await fetch(`/api/reports/reliability/${testId}`);
			if (res.ok) {
				const data = await res.json();
				setTest(data);
			} else {
				router.push("/reports/reliability");
			}
		} catch {
			router.push("/reports/reliability");
		} finally {
			setLoading(false);
		}
	}, [testId, router]);

	useEffect(() => {
		fetchTest();
	}, [fetchTest]);

	// Generate 30 sequential dates starting from test.startDate
	const sheetRows = useMemo(() => {
		if (!test) return [];
		
		const startDate = new Date(test.startDate);
		startDate.setUTCHours(0, 0, 0, 0);

		const rows = [];
		for (let i = 0; i < 30; i++) {
			const date = new Date(startDate);
			date.setUTCDate(startDate.getUTCDate() + i);
			const dateStr = date.toISOString().split("T")[0];
			
			// Find existing log for this date
			const existingLog = test.dailyLogs.find(l => {
				const lDate = new Date(l.logDate).toISOString().split("T")[0];
				return lDate === dateStr;
			});

			rows.push({
				date: dateStr,
				id: existingLog?.id || null,
				data: existingLog || {
					cycleCount: "",
					pcb: "",
					feedValve: "",
					washMotor: "",
					clutch: "",
					errorDetail: "",
					otherIssues: "",
					remarks: "",
				}
			});
		}
		return rows;
	}, [test]);

	const handleInlineUpdate = async (logDate: string, field: string, value: any) => {
		setSavingField(`${logDate}-${field}`);
		try {
			const res = await fetch(`/api/reports/reliability/${testId}/logs`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ logDate, [field]: value }),
			});
			if (!res.ok) {
				// Handle Error
			}
		} catch (error) {
			console.error("Network error during inline update:", error);
		} finally {
			setSavingField(null);
		}
	};

	if (loading && !test) {
		return (
			<div className="flex flex-col items-center justify-center py-20 animate-pulse text-slate-400">
				<div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin mb-4" />
				<p className="font-bold">Initializing Laboratory Sheet...</p>
			</div>
		);
	}

	if (!test) return null;

	return (
		<div className="max-w-[1400px] mx-auto pb-20 print:p-0">
			{/* Back Link - Hidden on print */}
			<Link href="/reports/reliability" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm mb-6 print:hidden">
				← Back to Reliability Overview
			</Link>

			{/* THE EXCEL SHEET */}
			<div className="bg-white border-[1.5px] border-black shadow-2xl overflow-hidden print:shadow-none print:border-black">
				
				{/* SHEET TITLE HEADER */}
				<div className="bg-slate-200 border-b-[1.5px] border-black p-1 text-center font-black text-sm uppercase tracking-widest text-slate-900 flex justify-between items-center px-4">
					<div className="w-24"></div>
					<div className="flex-1">Part Reliability Check sheet</div>
					<div className="text-[10px] font-black italic text-slate-400">Cycle #{test.id}</div>
				</div>

				{/* METADATA HEADER TABLE (Excel Header) */}
				<div className="grid grid-cols-12 border-b-[1.5px] border-black font-bold text-xs uppercase">
					{/* Left Section (Span 8) */}
					<div className="col-span-8 flex flex-col border-r-[1.5px] border-black">
						<div className="flex border-b-[1.5px] border-black h-10 items-center">
							<div className="w-[150px] p-2 border-r-[1.5px] border-black bg-slate-50">Model/Cap.:-</div>
							<div className="flex-1 p-2">{test.modelCap}</div>
						</div>
						<div className="flex border-b-[1.5px] border-black h-10 items-center">
							<div className="w-[150px] p-2 border-r-[1.5px] border-black bg-slate-50">Part name:-</div>
							<div className="flex-1 p-2 font-black italic">{test.partName}</div>
						</div>
						<div className="flex border-b-[1.5px] border-black h-10 items-center">
							<div className="w-[150px] p-2 border-r-[1.5px] border-black bg-slate-50">Vendor:-</div>
							<div className="flex-1 p-2">{test.vendor}</div>
						</div>
						<div className="flex h-10 items-center">
							<div className="w-[150px] p-2 border-r-[1.5px] border-black bg-slate-50">Cloth Load</div>
							<div className="flex-1 p-2 text-center text-slate-900 font-black">{test.clothLoad}</div>
						</div>
					</div>
					
					{/* Right Section (Span 4) */}
					<div className="col-span-4 p-4 flex flex-col justify-between bg-slate-50/10 h-full min-h-[160px]">
						<div className="border-[1.5px] border-black p-4 flex flex-col justify-center items-center h-full">
							<div className="text-[14px] font-black italic text-slate-900 mb-1">Test Start date:-</div>
							<div className="text-[20px] font-black text-blue-600 underline decoration-black/20">
								{new Date(test.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
							</div>
						</div>
						<div className="flex items-center justify-between mt-4">
							<div className="h-8 flex items-center px-3 border border-black rounded font-black text-[10px] bg-slate-200">Result:- Ongoing</div>
							<div className="text-[32px] font-black italic tracking-tighter leading-none text-slate-900 select-none">
								D<span className="text-blue-600">I</span>XON
							</div>
						</div>
					</div>
				</div>

				{/* RECORDING GRID (Chronological Rows) */}
				<div className="w-full overflow-x-auto">
					<table className="w-full border-collapse border-b-[1.5px] border-black table-fixed">
						<thead>
							<tr className="bg-slate-100 text-[9px] font-black uppercase text-center border-b-[1.5px] border-black h-12 leading-tight">
								<th className="border-r-[1.5px] border-black w-[100px]">DATE</th>
								<th className="border-r-[1.5px] border-black w-[80px]">NO. OF CYCLE</th>
								<th className="border-r-[1.5px] border-black w-[80px]">PCB</th>
								<th className="border-r-[1.5px] border-black w-[90px]">FEED VALVE</th>
								<th className="border-r-[1.5px] border-black w-[90px]">Wash Motor</th>
								<th className="border-r-[1.5px] border-black w-[80px]">CLUTCH</th>
								<th className="border-r-[1.5px] border-black w-[220px]">ERROR CODE/CYCLE NO / TIME</th>
								<th className="border-r-[1.5px] border-black w-[180px]">ANY OTHER ISSUES</th>
								<th className="">Remarks</th>
							</tr>
						</thead>
						<tbody className="text-[10px] font-bold">
							{sheetRows.map((row) => (
								<tr key={row.date} className="h-9 border-b border-black/10 hover:bg-slate-50 transition-colors">
									<td className="border-r-[1.5px] border-black text-center font-black bg-slate-100/50">{formatDateExcel(row.date)}</td>
									<td className="border-r-[1.5px] border-black relative">
										<input 
											type="number" 
											defaultValue={row.data.cycleCount || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "cycleCount", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none focus:bg-blue-50 text-center font-black ${savingField === `${row.date}-cycleCount` ? 'animate-pulse' : ''}`} 
										/>
									</td>
									<td className="border-r-[1.5px] border-black relative">
										<input 
											type="text" 
											defaultValue={row.data.pcb || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "pcb", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none focus:bg-blue-50 text-center uppercase ${savingField === `${row.date}-pcb` ? 'animate-pulse' : ''}`} 
										/>
									</td>
									<td className="border-r-[1.5px] border-black relative">
										<input 
											type="text" 
											defaultValue={row.data.feedValve || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "feedValve", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none focus:bg-blue-50 text-center uppercase ${savingField === `${row.date}-feedValve` ? 'animate-pulse' : ''}`} 
										/>
									</td>
									<td className="border-r-[1.5px] border-black relative">
										<input 
											type="text" 
											defaultValue={row.data.washMotor || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "washMotor", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none focus:bg-blue-50 text-center uppercase ${savingField === `${row.date}-washMotor` ? 'animate-pulse' : ''}`} 
										/>
									</td>
									<td className="border-r-[1.5px] border-black relative">
										<input 
											type="text" 
											defaultValue={row.data.clutch || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "clutch", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none focus:bg-blue-50 text-center uppercase ${savingField === `${row.date}-clutch` ? 'animate-pulse' : ''}`} 
										/>
									</td>
									<td className="border-r-[1.5px] border-black relative">
										<input 
											type="text" 
											defaultValue={row.data.errorDetail || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "errorDetail", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none focus:bg-blue-50 text-[9px] uppercase ${savingField === `${row.date}-errorDetail` ? 'animate-pulse' : ''}`} 
										/>
									</td>
									<td className="border-r-[1.5px] border-black relative">
										<input 
											type="text" 
											defaultValue={row.data.otherIssues || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "otherIssues", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none focus:bg-blue-50 italic text-[9px] ${savingField === `${row.date}-otherIssues` ? 'animate-pulse' : ''}`} 
										/>
									</td>
									<td className="relative">
										<input 
											type="text" 
											defaultValue={row.data.remarks || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "remarks", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none focus:bg-blue-50 text-[9px] ${savingField === `${row.date}-remarks` ? 'animate-pulse' : ''}`} 
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* BOTTOM ACTIONS - Hidden on print */}
				<div className="p-4 bg-slate-50 border-t-[1.5px] border-black flex justify-between items-center print:hidden">
					<div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
						Note: Changes save automatically when you click out of a cell.
					</div>
					<button 
						onClick={() => window.print()}
						className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transform active:scale-95 transition-all flex items-center gap-3"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4h10z" />
						</svg>
						Print Laboratory Sheet
					</button>
				</div>
			</div>
			
			<style jsx global>{`
				@media print {
					@page { margin: 0.5cm; size: landscape; }
					body { background: white !important; margin: 0; padding: 0; }
					.print\\:hidden { display: none !important; }
					input::-webkit-outer-spin-button,
					input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
					input { border: none !important; color: black !important; background: transparent !important; }
					* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
				}
			`}</style>
		</div>
	);
}
