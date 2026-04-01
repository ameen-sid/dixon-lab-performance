"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});

			if (res.ok) {
				router.push("/dashboard");
				router.refresh();
			} else {
				const data = await res.json();
				setError(data.error || "Failed to log in");
			}
		} catch (err) {
			setError("Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden selection:bg-blue-100 selection:text-blue-900">
			{/* Modern Background Glow Effects */}
			<div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
			<div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>

			<div className="w-full max-w-md relative z-10 px-6">
				{/* Header Section */}
				<div className="text-center mb-10">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-6 text-white transform hover:scale-105 transition-transform duration-300">
						{/* Modern Shield Icon */}
						<svg
							className="w-8 h-8"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
							/>
						</svg>
					</div>
					<h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
						DIXON QA
					</h1>
					<p className="text-slate-500 mt-2 font-medium">
						Reliability Testing Portal
					</p>
				</div>

				{/* Glassmorphism Form Card */}
				<div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
					{error && (
						<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center border border-red-100 flex items-center justify-center gap-2 font-medium">
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							{error}
						</div>
					)}

					<form onSubmit={handleLogin} className="space-y-5">
						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
								Username
							</label>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none text-slate-700 placeholder:text-slate-400"
								placeholder="Enter your username"
							/>
						</div>

						<div>
							<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
								Password
							</label>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 outline-none text-slate-700 placeholder:text-slate-400"
								placeholder="••••••••"
							/>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-slate-900 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/10 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed mt-4 shadow-md"
						>
							{isLoading ? (
								<div className="flex items-center justify-center gap-2">
									<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span>Signing in...</span>
								</div>
							) : (
								"Sign In"
							)}
						</button>
					</form>
				</div>

				<p className="text-center text-sm text-slate-400 mt-8 font-medium">
					&copy; {new Date().getFullYear()} Dixon Technologies
				</p>
			</div>
		</div>
	);
}
