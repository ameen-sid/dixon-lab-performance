"use client";

import { useState } from "react";
import { assignToEngineer } from "@/src/app/actions/manager-actions";

export default function AssignmentPanel({ request, engineers, currentUserId }: { request: any, engineers: any[], currentUserId: number }) {
	const [loading, setLoading] = useState(false);

	const handleAssign = async (engineerId: string) => {
		if (!engineerId) return;
		setLoading(true);
		try {
			await assignToEngineer(request.id, parseInt(engineerId));
		} catch (error) {
			alert("Failed to assign engineer");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-end gap-3">
			<select
				onChange={(e) => handleAssign(e.target.value)}
				disabled={loading}
				value={request.assignedToId || ""}
				className="text-[10px] font-bold bg-slate-100 border-none rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
			>
				<option value="" disabled>Assign Engineer...</option>
				<option value={currentUserId}>Assign to Me (Manager)</option>
				{engineers.map((eng) => (
					<option key={eng.id} value={eng.id}>
						{eng.name}
					</option>
				))}
			</select>
		</div>
	);
}
