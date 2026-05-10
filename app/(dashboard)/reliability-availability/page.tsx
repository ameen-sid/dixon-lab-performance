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
				<button onClick={fetchStations} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
					<svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				</button>
			</div>

			{/* Platforms Grid - Compact 7x2 layout */}
			<div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 min-h-0 overflow-hidden">
				{loading && stations.length === 0 ? (
					Array.from({ length: 14 }).map((_, i) => (
						<div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
					))
				) : (
					platforms.map((platform) => (
						<CompactPlatform key={platform.id} platform={platform} />
					))
				)}
			</div>
		</div>
	);
}

function CompactPlatform({ platform }: { platform: Platform }) {
	return (
		<div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 hover:border-blue-300 transition-colors">
			{/* Small Header */}
			<div className="bg-slate-900 py-2 px-3 rounded-t-[0.9rem] flex justify-between items-center">
				<span className="text-xs font-black text-white">{platform.id}</span>
				<span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Unit</span>
			</div>

			{/* Compact Station Grid - 2x5 */}
			<div className="flex-1 p-2 grid grid-cols-2 gap-1.5">
				{platform.stations.map((station) => (
					<CompactStation key={station.id} station={station} />
				))}
			</div>
		</div>
	);
}

function CompactStation({ station }: { station: Station }) {
	const isOccupied = station.status === "OCCUPIED";
	const test = station.reliabilityTest;
	const isPlanned = (test as any)?.isPlanned;

	return (
		<div className={`
			relative aspect-square md:aspect-auto p-1.5 rounded-lg border flex flex-col items-center justify-center transition-all group/station cursor-help
			${isOccupied 
				? "bg-rose-50 border-rose-100" 
				: "bg-emerald-50 border-emerald-100"}
		`}>
			<span className={`text-[9px] font-black leading-none ${isOccupied ? "text-rose-700" : "text-emerald-700"}`}>
				{station.id.split("-S")[1]}
			</span>
			<div className={`
				w-1 h-1 rounded-full mt-1
				${isOccupied ? "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]" : "bg-emerald-500"}
			`} />

			{/* Compact Tooltip */}
			<div className="fixed opacity-0 group-hover/station:opacity-100 transition-all duration-200 pointer-events-none z-[100] scale-90 group-hover/station:scale-100 transform -translate-x-1/2 -translate-y-full mb-2">
				<div className="bg-slate-900 text-white rounded-xl p-4 shadow-2xl w-56 border border-slate-700">
					{isOccupied && test ? (
						<div className="space-y-2">
							<div className="flex justify-between items-center border-b border-white/10 pb-1.5">
								<span className="text-[8px] font-black uppercase text-white/50">{isPlanned ? "Planned" : "Active"}</span>
								<span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-rose-500 uppercase">Occupied</span>
							</div>
							<p className="text-[10px] font-bold leading-tight">{test.partName}</p>
							<p className="text-[9px] font-bold text-blue-400">{test.nameOfTest}</p>
						</div>
					) : (
						<p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center py-1">Station Available</p>
					)}
				</div>
			</div>
		</div>
	);
}
