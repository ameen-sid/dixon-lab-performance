"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

function NavLink({
	href,
	children,
	exact = false,
}: {
	href: string;
	children: React.ReactNode;
	exact?: boolean;
}) {
	const pathname = usePathname();
	const isActive = exact ? pathname === href : pathname.startsWith(href);

	return (
		<Link
			href={href}
			className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
				isActive
					? "bg-blue-600/15 text-blue-400 shadow-inner"
					: "hover:bg-slate-800/50 hover:text-white text-slate-400"
			}`}
		>
			{children}
		</Link>
	);
}

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const [loggingOut, setLoggingOut] = useState(false);

	const handleLogout = async () => {
		setLoggingOut(true);
		try {
			await fetch("/api/auth/logout", { method: "POST" });
		} finally {
			router.push("/login");
		}
	};

	return (
		<div className="fixed inset-0 flex overflow-hidden bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 print:relative print:block print:h-auto print:overflow-visible">
			{/* Modern Dark Sidebar */}
			<aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 flex-shrink-0 print:hidden">
				{/* Brand Header */}
				<div className="h-20 flex items-center px-6 border-b border-slate-800/60">
					<div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20 flex-shrink-0">
						<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<div>
						<h1 className="text-base font-bold text-white tracking-wide">DIXON QA</h1>
						<p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
							Reliability Portal
						</p>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
					{/* Overview */}
					<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
						Overview
					</p>
					<NavLink href="/dashboard" exact>
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
						Dashboard
					</NavLink>

					{/* Functional Tests */}
					<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">
						Functional Tests
					</p>
					<NavLink href="/reports/functional/new">
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						New Functional Test
					</NavLink>
					<NavLink href="/reports/functional" exact>
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
						Test History
					</NavLink>

					{/* Reliability */}
					<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">
						Reliability
					</p>
					<NavLink href="/reports/reliability" exact>
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Reliability Cycles
					</NavLink>
					<NavLink href="/reports/reliability/new">
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Start New Cycle
					</NavLink>

					{/* Configuration */}
					<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">
						Configuration
					</p>
					<NavLink href="/master-data/protocols">
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						Test Protocols
					</NavLink>
					<NavLink href="/master-data/suppliers">
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
						Suppliers
					</NavLink>
					<NavLink href="/master-data/products">
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
						Product / Part Names
					</NavLink>
					<NavLink href="/master-data/users">
						<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						Users
					</NavLink>
				</nav>

				{/* User Profile / Logout */}
				<div className="p-3 m-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-black text-white shadow-sm">
							A
						</div>
						<div>
							<p className="text-sm font-semibold text-white">Admin</p>
							<p className="text-xs text-slate-400">Lab Manager</p>
						</div>
					</div>
					<button
						onClick={handleLogout}
						disabled={loggingOut}
						title="Logout"
						className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors disabled:opacity-50"
					>
						{loggingOut ? (
							<div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
						) : (
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
						)}
					</button>
				</div>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col min-h-0 overflow-hidden print:block print:h-auto print:overflow-visible">
				{/* Top Header */}
				<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0 print:hidden">
					<PageTitle />
					<div className="flex items-center gap-4">
						<span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
							System Online
						</span>
					</div>
				</header>

				{/* Scrollable Page Content */}
				<div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 print:p-0 print:bg-white print:overflow-visible">
					<div className="max-w-7xl mx-auto">{children}</div>
				</div>
			</main>
		</div>
	);
}

function PageTitle() {
	const pathname = usePathname();

	const titleMap: Record<string, string> = {
		"/dashboard": "Dashboard Overview",
		"/reports/functional/new": "New Functional Test",
		"/reports/functional": "Functional Test History",
		"/reports/reliability": "Reliability Cycles",
		"/reports/reliability/new": "Start New Cycle",
		"/master-data/protocols": "Test Protocols",
		"/master-data/suppliers": "Suppliers",
		"/master-data/products": "Product / Part Names",
		"/master-data/users": "User Management",
	};

	const title =
		titleMap[pathname] ??
		(pathname.startsWith("/reports/reliability/") ? "Cycle Detail" : "Dixon QA Portal");

	return <h2 className="text-lg font-bold text-slate-800">{title}</h2>;
}
