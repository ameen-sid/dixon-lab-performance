"use client";

import { useState } from "react";
import { approveRequest, rejectRequest } from "@/src/app/actions/head-actions";

export default function RequestActionButtons({ request }: { request: any }) {
	const [isRejecting, setIsRejecting] = useState(false);
	const [remarks, setRemarks] = useState("");
	const [loading, setLoading] = useState(false);

	if (request.status !== "Pending") {
		return (
			<span className="text-xs font-medium text-slate-400 italic">
				No actions available
			</span>
		);
	}

	const handleApprove = async () => {
		if (confirm("Are you sure you want to approve this request?")) {
			setLoading(true);
			try {
				await approveRequest(request.id);
			} catch (error) {
				alert("Failed to approve request");
			} finally {
				setLoading(false);
			}
		}
	};

	const handleReject = async () => {
		if (!remarks.trim()) {
			alert("Please provide remarks for rejection");
			return;
		}
		setLoading(true);
		try {
			await rejectRequest(request.id, remarks);
			setIsRejecting(false);
			setRemarks("");
		} catch (error) {
			alert("Failed to reject request");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex justify-end gap-2">
			{!isRejecting ? (
				<>
					<button
						onClick={handleApprove}
						disabled={loading}
						className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
					>
						Approve
					</button>
					<button
						onClick={() => setIsRejecting(true)}
						disabled={loading}
						className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
					>
						Reject
					</button>
				</>
			) : (
				<div className="flex flex-col gap-2 items-end animate-in fade-in slide-in-from-right-2">
					<textarea
						value={remarks}
						onChange={(e) => setRemarks(e.target.value)}
						placeholder="Reason for rejection..."
						className="w-48 px-2 py-1.5 text-xs border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none"
						rows={2}
					/>
					<div className="flex gap-2">
						<button
							onClick={handleReject}
							disabled={loading}
							className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
						>
							Confirm Reject
						</button>
						<button
							onClick={() => setIsRejecting(false)}
							disabled={loading}
							className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
						>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
