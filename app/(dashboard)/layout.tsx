"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

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
	const searchParams = useSearchParams();

	// Create current full path with params for comparison
	const currentFull = pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");

	const hasParams = href.includes("?");

	// Logic: 
	// 1. If link has params, match exactly.
	// 2. If link doesn't have params but current path DOES, it's not active (to separate /reports from /reports?filter=failed)
	// 3. Otherwise use standard pathname logic.
	const isActive = hasParams
		? currentFull === href
		: (searchParams.toString() !== "" ? false : (exact ? pathname === href : pathname.startsWith(href)));

	return (
		<Link
			href={href}
			className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${isActive
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
	const [user, setUser] = useState<{ name: string; role: string; username: string } | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchUser() {
			try {
				const res = await fetch("/api/auth/me");
				if (res.ok) {
					const data = await res.json();
					setUser(data.user);
				} else {
					router.push("/login");
				}
			} catch (e) {
				console.error("Failed to fetch user:", e);
			} finally {
				setLoading(false);
			}
		}
		fetchUser();
	}, [router]);

	const handleLogout = async () => {
		setLoggingOut(true);
		try {
			await fetch("/api/auth/logout", { method: "POST" });
		} finally {
			router.push("/login");
		}
	};

	if (loading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-slate-50">
				<div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
			</div>
		);
	}

	const isRequester = user?.role === "Requester";
	const isHead = user?.role === "Head";
	const isManager = user?.role === "Lab Manager";
	const isEngineer = user?.role === "Engineer";
	const isInspector = user?.role === "Inspector";
	const isCeo = user?.role === "CEO" || user?.role === "ceo";

	return (
		<div className="fixed inset-0 flex overflow-hidden bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 print:relative print:block print:h-auto print:overflow-visible">
			{/* Modern Dark Sidebar */}
			{!isCeo && (
				<aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 flex-shrink-0 print:hidden">
				{/* Brand Header */}
				<div className="h-24 flex items-center justify-center px-6 border-b border-slate-800/60">
					<div className="bg-white w-full py-3 px-4 rounded-xl flex items-center justify-center shadow-lg">
						<img src="/logo.png" alt="Dixon Logo" className="h-10 w-auto object-contain" />
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto no-scrollbar">
					<Suspense fallback={<div className="h-40 animate-pulse bg-slate-800/50 rounded-xl m-4" />}>
						{isRequester ? (
							<>
								<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
									My Portal
								</p>
								<NavLink href="/dashboard/requester" exact>
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
									</svg>
									Dashboard
								</NavLink>
								<NavLink href="/dashboard/requester/requests">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									My Requests
								</NavLink>
								<NavLink href="/dashboard/requester/capa">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									CAPA Management
								</NavLink>
							</>
						) : isHead ? (
							<>
								<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
									Head Portal
								</p>
								<NavLink href="/dashboard/head" exact>
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
									</svg>
									Dashboard
								</NavLink>
								<NavLink href="/dashboard/head/requests">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									Sample Tests
								</NavLink>
								<NavLink href="/dashboard/head/test-reports">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5m11 2a4 4 0 014 4v2m-3-3l3 3m0 0l-3 3m3-3H8" />
									</svg>
									Completed Reports
								</NavLink>
								<NavLink href="/dashboard/head/test-reports?filter=failed">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									Failure Decisions
								</NavLink>
								<NavLink href="/dashboard/head/capa">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									CAPA Reports
								</NavLink>
							</>
						) : isManager ? (
							<>
								<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
									Overview
								</p>
								<NavLink href="/dashboard/manager" exact>
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
									</svg>
									Dashboard
								</NavLink>
								<NavLink href="/reliability-availability">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
									</svg>
									Platform Tracking
								</NavLink>
								<NavLink href="/dashboard/manager/top-equipment-tracking">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
									</svg>
									Equipment Tracking
								</NavLink>

								<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">
									Planning
								</p>
								<NavLink href="/dashboard/manager/plans">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									Test Plans
								</NavLink>

								<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">
									Operations
								</p>
								<NavLink href="/dashboard/manager/requests">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Approved Sample Requests
								</NavLink>
								<NavLink href="/dashboard/manager/assigned-samples">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									Assigned Samples
								</NavLink>
								<NavLink href="/dashboard/manager/capa">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									CAPA Management
								</NavLink>

							</>
						) : isEngineer ? (
							<>
								<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
									Engineer Portal
								</p>
								<NavLink href="/dashboard/engineer" exact>
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
									</svg>
									Dashboard
								</NavLink>
								<NavLink href="/dashboard/engineer/samples">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
									Assigned Samples
								</NavLink>
							</>
						) : isInspector ? (
							<>
								<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
									Inspector Portal
								</p>
								<NavLink href="/dashboard/inspector" exact>
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
									</svg>
									Dashboard
								</NavLink>
								<NavLink href="/dashboard/inspector/tests">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									Daily Checksheets
								</NavLink>
							</>
						) : (
							<>
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
								<NavLink href="/reliability-availability">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
									</svg>
									Platform Availability
								</NavLink>
								<NavLink href="/dashboard/manager/top-equipment-tracking">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
									</svg>
									Top Equipment Availability
								</NavLink>



								<p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6">
									Configuration
								</p>
								<NavLink href="/master-data/departments">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
									Departments
								</NavLink>
								<NavLink href="/master-data/users">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									Users
								</NavLink>
								<NavLink href="/master-data/test-types">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									Test Types
								</NavLink>

								<NavLink href="/master-data/test-categories">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
									</svg>
									Test Categories
								</NavLink>

								<NavLink href="/master-data/protocols">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									Test Protocols
								</NavLink>
								<NavLink href="/master-data/products">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
									</svg>
									Product / Part Names
								</NavLink>
								<NavLink href="/master-data/suppliers">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
									</svg>
									Suppliers / Customers
								</NavLink>
								<NavLink href="/master-data/testing-equipment">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
									</svg>
									R&D Testing Equipments
								</NavLink>
								<NavLink href="/master-data/top-equipment">
									<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
									</svg>
									Top Equipments
								</NavLink>
							</>
						)}
					</Suspense>
				</nav>

				{/* User Profile / Logout */}
				<div className="p-3 m-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-black text-white shadow-sm">
							{user?.name?.[0] || "U"}
						</div>
						<div>
							<p className="text-sm font-semibold text-white truncate max-w-[100px]">{user?.name || "User"}</p>
							<p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.role || "Member"}</p>
						</div>
					</div>
					<button
						onClick={handleLogout}
						disabled={loggingOut}
						title="Logout"
						className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
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
			)}

			{/* Main Content Area */}
			<main className="flex-1 flex flex-col min-h-0 overflow-hidden print:block print:h-auto print:overflow-visible">
				{/* Top Header */}
				<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 flex-shrink-0 print:hidden">
					<Suspense fallback={<div className="h-6 w-40 bg-slate-100 animate-pulse rounded-md" />}>
						<PageTitle />
					</Suspense>
					<div className="flex items-center gap-4">
						{isCeo && (
							<button
								onClick={handleLogout}
								className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors mr-4 cursor-pointer"
							>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
								</svg>
								Logout
							</button>
						)}
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
	const searchParams = useSearchParams();
	const currentFull = pathname + (searchParams.toString() ? "?" + searchParams.toString() : "");

	if (pathname === "/dashboard/ceo") {
		return (
			<div className="flex items-center py-1">
				<img src="/logo.png" alt="Dixon Logo" className="h-10 w-auto object-contain" />
			</div>
		);
	}

	const titleMap: Record<string, string> = {
		"/dashboard": "Dashboard Overview",
		"/dashboard/requester": "Requester Dashboard",
		"/dashboard/requester/requests": "My Requests",
		"/dashboard/requester/new": "New Request",
		"/dashboard/requester/capa": "CAPA Management",
		"/dashboard/head": "Head Overview",
		"/dashboard/head/requests": "Sample Tests",
		"/dashboard/head/test-reports": "Completed Reports Sign-off",
		"/dashboard/head/test-reports?filter=failed": "Failure Decisions",
		"/dashboard/head/capa": "CAPA Reports Oversight",
		"/dashboard/manager": "Lab Manager Dashboard",
		"/dashboard/manager/requests": "Approved Sample Requests",
		"/dashboard/manager/capa": "CAPA Management",
		"/dashboard/engineer": "Engineer Dashboard",
		"/dashboard/engineer/samples": "Assigned Samples",
		"/reports/functional/new": "New Test",
		"/reports/functional": "Test History",
		"/reports/reliability/new": "Start New Cycle",
		"/reports/reliability": "Reliability Cycles",
		"/reliability-availability": "Platform Availability",
		"/master-data/protocols": "Test Protocols",
		"/master-data/suppliers": "Supplier / Customer Management",
		"/master-data/departments": "Department Management",
		"/master-data/products": "Product / Part Names",
		"/master-data/testing-equipment": "R&D Testing Equipment",
		"/master-data/top-equipment": "Top Equipment Management",
		"/master-data/test-types": "Test Type Management",
		"/master-data/test-categories": "Test Category Management",
		"/master-data/users": "User Management",
		"/dashboard/ceo": "Executive Dashboard Overview",
	};

	const title =
		titleMap[currentFull] ??
		titleMap[pathname] ??
		(pathname.startsWith("/reports/reliability/") ? "Cycle Detail" : "Dixon Portal");

	return <h2 className="text-lg font-bold text-slate-800">{title}</h2>;
}
