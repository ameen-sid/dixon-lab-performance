"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";

type StationStatus = "AVAILABLE" | "OCCUPIED";

interface Station {
	id: string;
	platformId: string;
	status: StationStatus;
	reliabilityTest?: {
		partName: string;
		nameOfTest: string;
		customerSupplier?: string;
		startDate?: string;
		endDate?: string;
	} | null;
}

interface Platform {
	id: string;
	stations: Station[];
}

export default function ReliabilityPlatformAvailability() {
	const [stations, setStations] = useState<Station[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedStation, setSelectedStation] = useState<Station | null>(null);

	const fetchStations = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/stations");
			if (res.ok) setStations(await res.json());
		} catch (err) {
			console.error("Error fetching stations:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStations();
		const interval = setInterval(fetchStations, 30000);
		return () => clearInterval(interval);
	}, [fetchStations]);

	const platforms: Platform[] = useMemo(() => {
		const groups: Record<string, Station[]> = {};
		stations.forEach((s) => {
			if (!groups[s.platformId]) groups[s.platformId] = [];
			groups[s.platformId].push(s);
		});

		return Object.entries(groups).map(([id, stns]) => ({
			id,
			stations: stns.sort((a, b) => {
				const aNum = parseInt(a.id.split("-S")[1]);
				const bNum = parseInt(b.id.split("-S")[1]);
				return aNum - bNum;
			})
		})).sort((a, b) => {
			const aNum = parseInt(a.id.replace("P", ""));
			const bNum = parseInt(b.id.replace("P", ""));
			return aNum - bNum;
		});
	}, [stations]);

	const totalAvailable = stations.filter(s => s.status === "AVAILABLE").length;
	const totalOccupied = stations.length - totalAvailable;

	return (
		<div className="h-[calc(100vh-120px)] flex flex-col gap-4 animate-in fade-in duration-500">
			{/* Compact Header */}
			<div className="flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
				<div className="flex items-center gap-6">
					<h2 className="text-xl font-black text-slate-900 tracking-tight">Platform Live Tracking</h2>
					<div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
						<div className="flex items-center gap-2">
							<span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
							<span className="text-emerald-600">Available: {totalAvailable}</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
							<span className="text-rose-600">Occupied/Reserved: {totalOccupied}</span>
						</div>
					</div>
				</div>
				<button onClick={fetchStations} className="p-2 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
					<svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				</button>
			</div>

			{/* Platforms Grid */}
			<div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 min-h-0 overflow-hidden">
				{loading && stations.length === 0 ? (
					Array.from({ length: 14 }).map((_, i) => (
						<div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
					))
				) : (
					platforms.map((platform) => (
						<div key={platform.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 hover:border-blue-300 transition-colors">
							<div className="bg-slate-900 py-2 px-3 rounded-t-[0.9rem] flex justify-between items-center">
								<span className="text-xs font-black text-white">{platform.id}</span>
								<span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Unit</span>
							</div>
							<div className="flex-1 p-2 grid grid-cols-2 gap-1.5">
								{platform.stations.map((station) => (
									<button
										key={station.id}
										onClick={() => setSelectedStation(station)}
										className={`
											relative aspect-auto p-2 rounded-lg border flex flex-col items-center justify-center transition-all group/station transform active:scale-90 cursor-pointer
											${station.status === "OCCUPIED"
												? "bg-rose-50 border-rose-100"
												: "bg-emerald-50 border-emerald-100 hover:bg-emerald-100"}
										`}
									>
										<span className={`text-[9px] font-black leading-none ${station.status === "OCCUPIED" ? "text-rose-700" : "text-emerald-700"}`}>
											{station.id.split("-S")[1]}
										</span>
										<div className={`
											w-1 h-1 rounded-full mt-1
											${station.status === "OCCUPIED" ? "bg-rose-500" : "bg-emerald-500"}
										`} />
									</button>
								))}
							</div>
						</div>
					))
				)}
			</div>

			{/* Station Detail Modal */}
			{selectedStation && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
					<div
						className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className={`px-8 py-6 flex justify-between items-center ${selectedStation.status === "OCCUPIED" ? "bg-rose-500" : "bg-emerald-500"}`}>
							<div>
								<p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Station Context</p>
								<h3 className="text-2xl font-black text-white leading-none mt-1">{selectedStation.id}</h3>
							</div>
							<button onClick={() => setSelectedStation(null)} className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-all cursor-pointer">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-8">
							<div className="flex items-center gap-4 mb-8">
								<div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedStation.status === "OCCUPIED" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
									{selectedStation.status === "OCCUPIED" ? (
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									) : (
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
										</svg>
									)}
								</div>
								<div>
									<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Current Status</p>
									<p className={`text-lg font-black mt-1 ${selectedStation.status === "OCCUPIED" ? "text-rose-600" : "text-emerald-600"}`}>
										{selectedStation.status === "OCCUPIED" ? "Unit Occupied" : "Unit Available"}
									</p>
								</div>
							</div>

							{selectedStation.status === "OCCUPIED" && selectedStation.reliabilityTest ? (
								<div className="space-y-6">
									<div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ongoing Test</p>
										<p className="text-sm font-black text-slate-800 leading-tight mb-1">{selectedStation.reliabilityTest.partName}</p>
										<p className="text-xs font-bold text-blue-600 uppercase tracking-tight">{selectedStation.reliabilityTest.nameOfTest}</p>
									</div>

									<div className="grid grid-cols-1 gap-4">
										<div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-xl bg-amber-200/50 flex items-center justify-center text-amber-700">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
												</div>
												<span className="text-xs font-black text-amber-800 uppercase tracking-tight">Reserved Until</span>
											</div>
											<span className="text-sm font-black text-amber-900">
												{selectedStation.reliabilityTest.endDate
													? format(new Date(selectedStation.reliabilityTest.endDate), "dd MMM yyyy")
													: "TBD"}
											</span>
										</div>
									</div>
								</div>
							) : (
								<div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 text-center">
									<p className="text-xs font-bold text-emerald-800 leading-relaxed">
										This station is currently free. You can assign a new test plan or schedule reliability testing for this unit.
									</p>
								</div>
							)}

							<button
								onClick={() => setSelectedStation(null)}
								className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
							>
								Close View
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
