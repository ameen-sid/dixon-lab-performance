"use client";

import { useState, useEffect, useCallback } from "react";

type TopEquipment = {
	id: number;
	name: string;
	status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
	createdAt: string;
};

export default function TopEquipmentTracking() {
	const [equipment, setEquipment] = useState<TopEquipment[]>([]);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState<number | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/master-data/top-equipment");
			if (res.ok) setEquipment(await res.json());
		} catch { /* fail */ }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { fetchData(); }, [fetchData]);

	const updateStatus = async (id: number, currentName: string, newStatus: string) => {
		setUpdating(id);
		try {
			const res = await fetch(`/api/master-data/top-equipment/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: currentName, status: newStatus }),
			});
			if (res.ok) {
				fetchData();
			}
		} catch { /* fail */ }
		finally { setUpdating(null); }
	};

	const getStatusConfig = (status: string) => {
		switch (status) {
			case "AVAILABLE": return { label: "FREE / READY", color: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" };
			case "OCCUPIED": return { label: "IN USE", color: "text-blue-600 bg-blue-50 border-blue-100", dot: "bg-blue-500" };
			case "MAINTENANCE": return { label: "MAINTENANCE", color: "text-amber-600 bg-amber-50 border-amber-100", dot: "bg-amber-500" };
			default: return { label: "UNKNOWN", color: "text-slate-600 bg-slate-50 border-slate-100", dot: "bg-slate-500" };
		}
	};

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="mb-8">
				<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Top Equipment Tracking</h2>
				<p className="text-slate-500 mt-1 font-medium">Monitor and manage the availability of testing rigs in real-time.</p>
			</div>

			{/* Equipment Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{loading ? (
					Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="h-40 bg-white rounded-3xl border border-slate-200 animate-pulse" />
					))
				) : equipment.length === 0 ? (
					<div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200">
						<p className="text-slate-400 font-bold">No equipment defined in Master Data.</p>
					</div>
				) : (
					equipment.map((item) => {
						const config = getStatusConfig(item.status);
						return (
							<div key={item.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
								<div className="flex justify-between items-start mb-4">
									<div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
										</svg>
									</div>
									<div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black tracking-widest ${config.color}`}>
										<span className={`w-2 h-2 rounded-full animate-pulse ${config.dot}`} />
										{config.label}
									</div>
								</div>

								<h3 className="text-xl font-bold text-slate-900 mb-6 truncate">{item.name}</h3>

								<div className="flex gap-2">
									<button
										disabled={updating === item.id || item.status === "AVAILABLE"}
										onClick={() => updateStatus(item.id, item.name, "AVAILABLE")}
										className="flex-1 py-2 rounded-xl text-[10px] font-black border transition-all hover:bg-emerald-50 hover:border-emerald-100 hover:text-emerald-600 disabled:opacity-30"
									>
										MAKE FREE
									</button>
									<button
										disabled={updating === item.id || item.status === "OCCUPIED"}
										onClick={() => updateStatus(item.id, item.name, "OCCUPIED")}
										className="flex-1 py-2 rounded-xl text-[10px] font-black border transition-all hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 disabled:opacity-30"
									>
										MARK IN-USE
									</button>
									<button
										disabled={updating === item.id || item.status === "MAINTENANCE"}
										onClick={() => updateStatus(item.id, item.name, "MAINTENANCE")}
										className="flex-1 py-2 rounded-xl text-[10px] font-black border transition-all hover:bg-amber-50 hover:border-amber-100 hover:text-amber-600 disabled:opacity-30"
									>
										REPAIR
									</button>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
