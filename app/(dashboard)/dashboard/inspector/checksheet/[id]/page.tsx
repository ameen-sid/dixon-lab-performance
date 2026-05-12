"use client";

import { useState, useEffect, useCallback, use, useMemo } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Plan = {
	id: number;
	testProtocol: { name: string; productType: string };
	testCategory: { name: string };
	stationIds: string | null;
	startDate: string;
	endDate: string;
	dailyLogs: any[];
};

export default function ChecksheetPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const [plan, setPlan] = useState<Plan | null>(null);
	const [loading, setLoading] = useState(true);
	const [savingField, setSavingField] = useState<string | null>(null);

	const fetchPlan = useCallback(async () => {
		try {
			const res = await fetch(`/api/inspector/checksheet/${id}`);
			if (res.ok) setPlan(await res.json());
		} catch { /* fail */ }
		finally { setLoading(false); }
	}, [id]);

	useEffect(() => { fetchPlan(); }, [fetchPlan]);

	const handleInlineUpdate = async (date: string, field: string, value: any) => {
		setSavingField(`${date}-${field}`);
		try {
			const res = await fetch(`/api/inspector/checksheet/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ date, [field]: value })
			});
			if (!res.ok) {
				console.error("Failed to update");
			}
		} catch (error) {
			console.error("Network error:", error);
		} finally {
			setSavingField(null);
		}
	};

	const sheetRows = useMemo(() => {
		if (!plan) return [];
		const start = new Date(plan.startDate);
		start.setUTCHours(0, 0, 0, 0);
		const end = new Date(plan.endDate);
		end.setUTCHours(0, 0, 0, 0);

		const rows = [];
		const curr = new Date(start);
		while (curr <= end) {
			const dateStr = curr.toISOString().split("T")[0];
			const log = plan.dailyLogs.find(l => new Date(l.date).toISOString().split("T")[0] === dateStr);

			rows.push({
				date: dateStr,
				data: log || {}
			});
			curr.setDate(curr.getDate() + 1);
		}
		return rows;
	}, [plan]);

	if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-400">Loading Laboratory Sheet...</div>;
	if (!plan) return <div className="p-20 text-center">Plan not found</div>;

	const isFATL = plan.testProtocol.productType === "FATL";
	const isSATL = plan.testProtocol.productType === "SATL";

	const fatlCols = [
		{ label: "Motor", field: "motor" },
		{ label: "Clutch", field: "clutch" },
		{ label: "Inlet Valve", field: "waterInlet" },
		{ label: "Pressure", field: "pressureSensor" },
		{ label: "PCB", field: "pcb" },
		{ label: "Susp. Rod", field: "suspensionRod" },
		{ label: "Drain Motor", field: "drainMotor" },
		{ label: "Lid Switch", field: "lidSwitch" },
		{ label: "Inverter", field: "inverterBoard" }
	];

	const satlCols = [
		{ label: "Wash Motor", field: "washMotor" },
		{ label: "Spin Motor", field: "spinMotor" },
		{ label: "Gear Box", field: "gearBox" },
		{ label: "Seal Bellow", field: "sealBellow" },
		{ label: "Wash Timer", field: "washTimer" },
		{ label: "Spin Timer", field: "spinTimer" },
		{ label: "Selector", field: "drainSelector" },
		{ label: "Capacitor", field: "capacitor" },
		{ label: "Safety SW", field: "safetySwitch" }
	];

	return (
		<div className="max-w-[1550px] mx-auto pb-12 animate-in fade-in duration-500 print:p-0">
			{/* Header Actions */}
			<div className="flex justify-between items-center mb-6 print:hidden">
				<Link href="/dashboard/inspector/tests" className="text-slate-500 hover:text-slate-900 font-bold text-sm flex items-center gap-2 group">
					<div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
						←
					</div>
					Back to Test Queue
				</Link>
				<div className="flex items-center gap-4">
					<div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mr-4">
						Tip: Cells save automatically on blur
					</div>
					<button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all">
						Print Sheet
					</button>
				</div>
			</div>

			{/* THE EXCEL SHEET */}
			<div className="bg-white border-[2px] border-black shadow-2xl overflow-hidden print:shadow-none print:border-black">

				{/* SHEET TITLE */}
				<div className="bg-slate-200 border-b-[2px] border-black p-2 text-center font-black text-base uppercase tracking-widest text-slate-900 flex justify-between items-center px-6">
					<div className="text-[10px] italic text-slate-500">QC Laboratory</div>
					<div className="flex-1">Reliability Life Test Chronology Check-sheet</div>
					<div className="text-[10px] font-black italic text-slate-500">Plan #{plan.id}</div>
				</div>

				{/* EXCEL HEADER TABLE */}
				<div className="grid grid-cols-12 border-b-[2px] border-black font-bold text-[11px] uppercase bg-white">
					<div className="col-span-8 flex flex-col border-r-[2px] border-black">
						<div className="flex border-b-[2px] border-black h-10 items-center">
							<div className="w-[140px] p-2 border-r-[2px] border-black bg-slate-100/50">Model / Cap.</div>
							<div className="flex-1 p-2 font-black">{plan.testProtocol.name}</div>
						</div>
						<div className="flex border-b-[2px] border-black h-10 items-center">
							<div className="w-[140px] p-2 border-r-[2px] border-black bg-slate-100/50">Category</div>
							<div className="flex-1 p-2 italic">{plan.testCategory.name}</div>
						</div>
						<div className="flex h-10 items-center">
							<div className="w-[140px] p-2 border-r-[2px] border-black bg-slate-100/50">Platform No.</div>
							<div className="flex-1 p-2 font-black text-blue-600">{plan.stationIds || "N/A"}</div>
						</div>
					</div>
					<div className="col-span-4 p-4 flex flex-col justify-center items-center">
						<img src="/logo.png" alt="Dixon Logo" className="h-10 w-auto object-contain" />
						<div className="mt-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Reliability Lab</div>
					</div>
				</div>

				{/* MAIN DATA GRID */}
				<div className="overflow-x-auto">
					<table className="w-full border-collapse table-fixed min-w-[1300px]">
						<thead>
							<tr className="bg-slate-100 text-[9px] font-black uppercase text-center border-b-[2px] border-black h-12 leading-tight">
								<th className="border-r-[2px] border-black w-[100px]">DATE</th>
								<th className="border-r-[2px] border-black w-[120px]">Load Condition</th>
								{isFATL && <th className="border-r-[2px] border-black w-[80px]">CYCLES</th>}
								{isSATL && (
									<>
										<th className="border-r-[2px] border-black w-[70px]">Wash Cyc</th>
										<th className="border-r-[2px] border-black w-[70px]">Spin Cyc</th>
									</>
								)}
								{(isFATL ? fatlCols : satlCols).map(col => (
									<th key={col.field} className="border-r-[2px] border-black w-[85px]">{col.label}</th>
								))}
								<th className="border-r-[2px] border-black w-[85px]">TOTAL CYC</th>
								<th className="w-[200px]">REMARKS</th>
							</tr>
						</thead>
						<tbody className="text-[10px] font-bold">
							{sheetRows.map((row) => (
								<tr key={row.date} className="h-10 border-b border-black text-center hover:bg-blue-50/30 transition-colors">
									<td className="border-r-[2px] border-black font-black bg-slate-50/50">{format(new Date(row.date), "dd-MM-yyyy")}</td>

									{/* Load Condition */}
									<td className="border-r-[2px] border-black relative">
										<input
											type="text"
											defaultValue={row.data.loadCondition || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "loadCondition", e.target.value)}
											className={`w-full h-full p-2 bg-transparent outline-none text-[9px] text-center ${savingField === `${row.date}-loadCondition` ? 'bg-yellow-50 animate-pulse' : ''}`}
										/>
									</td>

									{/* Cycles */}
									{isFATL && (
										<td className="border-r-[2px] border-black relative bg-blue-50/20">
											<input
												type="number"
												defaultValue={row.data.numCycles || ""}
												onBlur={(e) => handleInlineUpdate(row.date, "numCycles", e.target.value)}
												className="w-full h-full p-2 bg-transparent outline-none font-black text-blue-700 text-center"
											/>
										</td>
									)}
									{isSATL && (
										<>
											<td className="border-r-[2px] border-black relative bg-blue-50/20">
												<input
													type="number"
													defaultValue={row.data.numCyclesWash || ""}
													onBlur={(e) => handleInlineUpdate(row.date, "numCyclesWash", e.target.value)}
													className="w-full h-full p-2 bg-transparent outline-none font-black text-blue-700 text-center"
												/>
											</td>
											<td className="border-r-[2px] border-black relative bg-blue-50/20">
												<input
													type="number"
													defaultValue={row.data.numCyclesSpin || ""}
													onBlur={(e) => handleInlineUpdate(row.date, "numCyclesSpin", e.target.value)}
													className="w-full h-full p-2 bg-transparent outline-none font-black text-blue-700 text-center"
												/>
											</td>
										</>
									)}

									{/* Components */}
									{(isFATL ? fatlCols : satlCols).map(col => (
										<td key={col.field} className="border-r-[2px] border-black relative">
											<input
												type="text"
												defaultValue={row.data[col.field] || ""}
												onBlur={(e) => handleInlineUpdate(row.date, col.field, e.target.value)}
												className={`w-full h-full p-2 bg-transparent outline-none text-center uppercase ${savingField === `${row.date}-${col.field}` ? 'bg-yellow-50 animate-pulse' : ''}`}
												placeholder="-"
											/>
										</td>
									))}

									{/* Total Cycles */}
									<td className="border-r-[2px] border-black relative bg-slate-50">
										<input
											type="number"
											defaultValue={row.data.totalCycles || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "totalCycles", e.target.value)}
											className="w-full h-full p-2 bg-transparent outline-none font-black text-slate-900 text-center"
										/>
									</td>

									{/* Remarks */}
									<td className="relative">
										<input
											type="text"
											defaultValue={row.data.remarks || ""}
											onBlur={(e) => handleInlineUpdate(row.date, "remarks", e.target.value)}
											className="w-full h-full px-3 py-2 bg-transparent outline-none text-left italic text-[9px] text-slate-500"
											placeholder="..."
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* FOOTER */}
				<div className="bg-slate-200 border-t-[2px] border-black p-3 flex justify-between items-center px-6 print:hidden">
					<div className="flex gap-6 items-center">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-white border border-black"></div>
							<span className="text-[9px] font-black uppercase tracking-wider">Empty Cell = Pending</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 bg-blue-50/50 border border-black"></div>
							<span className="text-[9px] font-black uppercase tracking-wider">Blue Cell = Cycle Data</span>
						</div>
					</div>
					<div className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
						Automated Chronology System &copy; DIXON RELIABILITY LAB
					</div>
				</div>
			</div>

			<style jsx global>{`
				@media print {
					@page { margin: 0.5cm; size: landscape; }
					body { background: white !important; }
					.print\\:hidden { display: none !important; }
					table { border-collapse: collapse !important; }
					th, td { border: 2px solid black !important; }
				}
			`}</style>
		</div>
	);
}
