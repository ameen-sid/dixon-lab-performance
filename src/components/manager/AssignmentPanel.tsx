"use client";

import { useState } from "react";
import { assignToEngineer, triggerEmail } from "@/src/app/actions/manager-actions";

export default function AssignmentPanel({ request, engineers }: { request: any, engineers: any[] }) {
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

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

	const handleEmail = async () => {
		setLoading(true);
		try {
			await triggerEmail(request.id);
			setEmailSent(true);
			setTimeout(() => setEmailSent(false), 3000);
		} catch (error) {
			alert("Failed to trigger email");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-end gap-3">
			<button
				onClick={handleEmail}
				disabled={loading || emailSent}
				className={`p-2 rounded-xl transition-all ${
					emailSent 
						? "bg-emerald-100 text-emerald-600" 
						: "bg-blue-50 text-blue-600 hover:bg-blue-100"
				}`}
				title="Trigger Email Notification"
			>
				{emailSent ? (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				) : (
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
					</svg>
				)}
			</button>

			<select
				onChange={(e) => handleAssign(e.target.value)}
				disabled={loading}
				value={request.assignedToId || ""}
				className="text-[10px] font-bold bg-slate-100 border-none rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
			>
				<option value="" disabled>Assign Engineer...</option>
				{engineers.map((eng) => (
					<option key={eng.id} value={eng.id}>
						{eng.name} ({eng.role})
					</option>
				))}
			</select>
		</div>
	);
}
