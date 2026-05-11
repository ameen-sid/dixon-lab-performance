"use client";

import { useState } from "react";
import CreateTestPlanModal from "./CreateTestPlanModal";

export default function CreateTestPlanButton({ inspectionId, requestDetails }: { inspectionId: number, requestDetails: { name: string, model: string } }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/10 active:scale-95 ml-2 whitespace-nowrap"
			>
				<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Create Test Plan
			</button>

			<CreateTestPlanModal 
				isOpen={isOpen} 
				onClose={() => setIsOpen(false)} 
				inspectionId={inspectionId}
				requestDetails={requestDetails}
			/>
		</>
	);
}
