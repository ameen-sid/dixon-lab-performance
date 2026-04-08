"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

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
	} | null;
}

interface Platform {
	id: string;
	stations: Station[];
}

export default function ReliabilityPlatformAvailability() {
	const [stations, setStations] = useState<Station[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchStations = useCallback(async () => {
		try {
			const res = await fetch("/api/stations");
			if (res.ok) {
				setStations(await res.json());
			}
		} catch (err) {
			console.error("Error fetching stations:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStations();
		// Poll for updates every 30 seconds
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

	const totalAvailable = useMemo(() => stations.filter(s => s.status === "AVAILABLE").length, [stations]);
	const totalOccupied = stations.length - totalAvailable;

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header & Title */}
			<div className="mb-8 flex justify-between items-end">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Availability</h2>
					<p className="text-slate-500 mt-1 font-medium">Real-time status monitoring of all 14 testing platforms.</p>
				</div>
				<button 
					onClick={fetchStations}
					className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
					title="Refresh Data"
				>
					<svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				</button>
			</div>

			{/* Top Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
				<div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:border-emerald-200 transition-all duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Testing Capacity</p>
							<h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Available Stations</h3>
						</div>
						<div className="text-5xl font-extrabold text-emerald-500 tabular-nums">
							{loading ? "..." : totalAvailable}
						</div>
					</div>
					<div className="mt-6 flex gap-3 items-center">
						<div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
							<div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(totalAvailable / 140) * 100}%` }} />
						</div>
						<span className="text-xs font-bold text-slate-400 min-w-[35px]">{loading ? "0" : Math.round((totalAvailable / 140) * 100)}%</span>
					</div>
				</div>

				<div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group hover:border-rose-200 transition-all duration-300">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Testing Capacity</p>
							<h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Occupied Stations</h3>
						</div>
						<div className="text-5xl font-extrabold text-rose-500 tabular-nums">
							{loading ? "..." : totalOccupied}
						</div>
					</div>
					<div className="mt-6 flex gap-3 items-center">
						<div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
							<div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: `${(totalOccupied / 140) * 100}%` }} />
						</div>
						<span className="text-xs font-bold text-slate-400 min-w-[35px]">{loading ? "0" : Math.round((totalOccupied / 140) * 100)}%</span>
					</div>
				</div>
			</div>

			{/* Platforms List */}
			<div className="flex flex-col gap-6">
				{loading && stations.length === 0 ? (
					Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-48 bg-white/50 animate-pulse rounded-3xl border border-slate-100" />
					))
				) : (
					platforms.map((platform) => (
						<PlatformRow key={platform.id} platform={platform} />
					))
				)}
			</div>
		</div>
	);
}

function PlatformRow({ platform }: { platform: Platform }) {
	const topRow = platform.stations.slice(0, 5);
	const bottomRow = platform.stations.slice(5, 10);

	return (
		<div className="flex flex-row items-stretch bg-white rounded-3xl border border-slate-200 shadow-sm group/platform relative hover:shadow-md hover:border-blue-200 hover:z-[50] transition-all duration-300">
			{/* Platform ID Header */}
			<div className="w-[120px] bg-slate-900 flex flex-col items-center justify-center p-6 rounded-l-[1.4rem] group-hover/platform:bg-blue-600 transition-colors duration-500">
				<p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Unit</p>
				<span className="text-2xl font-extrabold text-white tracking-tight">
					{platform.id}
				</span>
			</div>

			{/* Stations Layout (2 Horizontal Rows) */}
			<div className="flex-1 p-6 flex flex-col gap-4">
				<div className="grid grid-cols-5 gap-4">
					{topRow.map((station) => (
						<StationItem key={station.id} station={station} />
					))}
				</div>
				<div className="grid grid-cols-5 gap-4">
					{bottomRow.map((station) => (
						<StationItem key={station.id} station={station} />
					))}
				</div>
			</div>
		</div>
	);
}

function StationItem({ station }: { station: Station }) {
	const isOccupied = station.status === "OCCUPIED";
	const test = station.reliabilityTest;

	return (
		<div className={`
			relative px-4 py-3 rounded-xl border border-slate-100 bg-white transition-all duration-300 group/station hover:z-[50] hover:border-blue-300 hover:shadow-md
		`}>
			<div className="flex items-center justify-between">
				<span className="text-[11px] font-bold tracking-tight text-slate-700">{station.id.split("-")[1]}</span>
				<div className={`
					w-2 h-2 rounded-full shadow-sm
					${isOccupied ? "bg-rose-500 animate-pulse ring-2 ring-rose-100" : "bg-emerald-500 ring-2 ring-emerald-100"}
				`} />
			</div>

			{/* Floating Detail Tooltip on Hover */}
			<div className="absolute left-1/2 -translate-x-1/2 bottom-[110%] w-64 opacity-0 group-hover/station:opacity-100 transition-all duration-300 pointer-events-none z-[60] scale-95 group-hover/station:scale-100 origin-bottom">
				<div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl relative">
					<div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900" />
					
					{isOccupied && test ? (
						<div className="space-y-3">
							<div className="flex items-center justify-between border-b border-white/10 pb-2">
								<span className="text-[9px] font-bold uppercase tracking-widest text-white/50">Active Test</span>
								<div className="px-2 py-0.5 rounded bg-rose-500 text-[8px] font-black uppercase">Occupied</div>
							</div>
							<div>
								<p className="text-[9px] text-white/40 font-bold mb-0.5 uppercase tracking-wide">Part Name</p>
								<p className="text-xs font-bold text-white leading-snug">{test.partName}</p>
							</div>
							<div>
								<p className="text-[9px] text-white/40 font-bold mb-0.5 uppercase tracking-wide">Test Category</p>
								<p className="text-[10px] font-bold text-blue-400">{test.nameOfTest}</p>
							</div>
							{test.customerSupplier && (
								<div>
									<p className="text-[9px] text-white/40 font-bold mb-0.5 uppercase tracking-wide">Vendor</p>
									<p className="text-[10px] font-bold text-white">{test.customerSupplier}</p>
								</div>
							)}
						</div>
					) : (
						<div className="flex items-center gap-3 py-1">
							<div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
								<div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
							</div>
							<div>
								<p className="text-[11px] font-bold text-white uppercase tracking-wider">Available</p>
								<p className="text-[9px] text-white/40 font-medium">Ready for next assignment</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
