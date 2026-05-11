export default function Loading() {
	return (
		<div className="max-w-7xl mx-auto pb-12 animate-pulse px-4">
			<div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
				<div className="space-y-3">
					<div className="h-10 w-64 bg-slate-200 rounded-2xl" />
					<div className="h-4 w-96 bg-slate-100 rounded-lg" />
				</div>
				<div className="h-16 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-sm" />
			</div>

			<div className="space-y-6">
				{[1, 2, 3].map((i) => (
					<div key={i} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
						<div className="flex justify-between items-start mb-8">
							<div className="space-y-4">
								<div className="h-6 w-32 bg-blue-50 rounded-full" />
								<div className="h-10 w-80 bg-slate-100 rounded-2xl" />
							</div>
							<div className="h-12 w-48 bg-slate-50 rounded-2xl" />
						</div>
						<div className="h-32 w-full bg-slate-50/50 rounded-3xl" />
					</div>
				))}
			</div>
		</div>
	);
}
