"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
}

export default function Pagination({ totalItems, itemsPerPage, currentPage }: PaginationProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	const handlePageChange = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("page", page.toString());
		router.push(`?${params.toString()}`);
	};

	if (totalPages <= 1) return null;

	return (
		<div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
			<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
				Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
			</p>
			<div className="flex items-center gap-2">
				<button
					type="button"
					disabled={currentPage === 1}
					onClick={() => handlePageChange(currentPage - 1)}
					className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
					</svg>
				</button>

				<div className="flex items-center gap-1">
					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<button
							key={page}
							type="button"
							onClick={() => handlePageChange(page)}
							className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all border shadow-sm active:scale-95 ${
								currentPage === page
									? "bg-slate-900 border-slate-900 text-white"
									: "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
							}`}
						>
							{page}
						</button>
					))}
				</div>

				<button
					type="button"
					disabled={currentPage === totalPages}
					onClick={() => handlePageChange(currentPage + 1)}
					className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</div>
	);
}
