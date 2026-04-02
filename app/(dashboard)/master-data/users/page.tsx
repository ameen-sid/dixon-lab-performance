"use client";

import { useState, useEffect, useCallback } from "react";

type User = {
	id: number;
	name: string;
	username: string;
	role: string;
	createdAt: string;
};

const ROLES = ["ADMIN", "MANAGER", "TECHNICIAN"];

const ROLE_STYLE: Record<string, string> = {
	ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
	MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
	TECHNICIAN: "bg-slate-100 text-slate-600 border-slate-200",
};

const AVATAR_COLORS = [
	"from-blue-500 to-indigo-500",
	"from-violet-500 to-purple-500",
	"from-emerald-500 to-teal-500",
	"from-amber-500 to-orange-500",
	"from-rose-500 to-pink-500",
];

export default function UserManagementPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	const [form, setForm] = useState({
		name: "",
		username: "",
		password: "",
		confirmPassword: "",
		role: "TECHNICIAN",
	});

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/users");
			if (res.ok) setUsers(await res.json());
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleChange = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		setError("");
	};

	const openModal = (user?: User) => {
		if (user) {
			setEditingUser(user);
			setForm({
				name: user.name,
				username: user.username,
				password: "",
				confirmPassword: "",
				role: user.role,
			});
		} else {
			setEditingUser(null);
			setForm({ name: "", username: "", password: "", confirmPassword: "", role: "TECHNICIAN" });
		}
		setError("");
		setShowModal(true);
	};

	const openDeleteModal = (user: User) => {
		setUserToDelete(user);
		setShowDeleteModal(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name || !form.username || (!editingUser && !form.password)) {
			setError("Name, username and password are required.");
			return;
		}
		if (form.password && form.password !== form.confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		if (form.password && form.password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		setSaving(true);
		try {
			const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
			const method = editingUser ? "PATCH" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name,
					username: form.username,
					password: form.password || undefined,
					role: form.role,
				}),
			});
			if (res.ok) {
				setSuccess(editingUser ? "User updated successfully!" : "User created successfully!");
				setShowModal(false);
				fetchUsers();
				setTimeout(() => setSuccess(""), 2500);
			} else {
				const d = await res.json();
				setError(d.error || `Failed to ${editingUser ? "update" : "create"} user.`);
			}
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!userToDelete) return;
		setDeleting(true);
		try {
			const res = await fetch(`/api/users/${userToDelete.id}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setSuccess("User deleted successfully!");
				setShowDeleteModal(false);
				fetchUsers();
				setTimeout(() => setSuccess(""), 2500);
			} else {
				const d = await res.json();
				setError(d.error || "Failed to delete user.");
			}
		} catch {
			setError("Network error. Please try again.");
		} finally {
			setDeleting(false);
			setUserToDelete(null);
		}
	};

	const formatDate = (d: string) =>
		new Date(d).toLocaleDateString("en-IN", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="flex justify-between items-end mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Manage lab technicians, managers, and admin access.
					</p>
				</div>
				<button
					onClick={() => openModal()}
					className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
					</svg>
					Add User
				</button>
			</div>

			{success && (
				<div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 flex items-center gap-2 font-medium animate-in fade-in">
					<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					{success}
				</div>
			)}

			{/* Stats */}
			<div className="grid grid-cols-3 gap-4 mb-8">
				{[
					{ label: "Total Users", value: users.length, color: "bg-slate-50 text-slate-600" },
					{ label: "Admins / Managers", value: users.filter((u) => u.role !== "TECHNICIAN").length, color: "bg-violet-50 text-violet-600" },
					{ label: "Technicians", value: users.filter((u) => u.role === "TECHNICIAN").length, color: "bg-blue-50 text-blue-600" },
				].map((stat) => (
					<div key={stat.label} className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
						<p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
					</div>
				))}
			</div>

			{/* User Table */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
				<div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
					<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span className="font-bold text-slate-700">{users.length} registered users</span>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
								<th className="px-6 py-4 font-bold border-b border-slate-200">User</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Username</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Role</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Joined</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Status</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								[...Array(4)].map((_, i) => (
									<tr key={i}>
										{[...Array(5)].map((__, j) => (
											<td key={j} className="px-6 py-4">
												<div className="h-4 bg-slate-100 rounded animate-pulse" />
											</td>
										))}
										<td className="px-6 py-4">
											<div className="h-8 w-16 bg-slate-100 rounded animate-pulse ml-auto" />
										</td>
									</tr>
								))
							) : users.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-6 py-20 text-center">
										<div className="flex flex-col items-center gap-3">
											<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
												<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
											</div>
											<p className="font-bold text-slate-500">No users yet</p>
										</div>
									</td>
								</tr>
							) : (
								users.map((user, idx) => (
									<tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
													{user.name.charAt(0).toUpperCase()}
												</div>
												<span className="font-semibold text-slate-800">{user.name}</span>
											</div>
										</td>
										<td className="px-6 py-4 font-mono text-sm text-slate-500">@{user.username}</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${ROLE_STYLE[user.role] ?? ROLE_STYLE.TECHNICIAN}`}>
												{user.role}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
										<td className="px-6 py-4">
											<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
												<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
												Active
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex justify-end gap-2">
												<button
													onClick={() => openModal(user)}
													className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
													title="Edit User"
												>
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => openDeleteModal(user)}
													className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
													title="Delete User"
												>
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add User Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center rounded-t-3xl">
							<h3 className="text-white font-bold flex items-center gap-2">
								<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingUser ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"} />
								</svg>
								{editingUser ? `Edit User: ${editingUser.name}` : "Create New User"}
							</h3>
							<button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<form onSubmit={handleSubmit} className="p-8 space-y-5">
							{error && (
								<div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100 font-medium flex items-center gap-2">
									<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{error}
								</div>
							)}

							<div className="grid grid-cols-2 gap-4">
								<div className="col-span-2">
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
										Full Name <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={form.name}
										onChange={(e) => handleChange("name", e.target.value)}
										autoFocus
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
										placeholder="e.g. Ramesh Kumar"
									/>
								</div>
								<div className="col-span-2">
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
										Username <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={form.username}
										onChange={(e) => handleChange("username", e.target.value)}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
										placeholder="e.g. ramesh.kumar"
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
										Password {editingUser ? <span className="text-slate-400 text-xs font-normal">(Leave blank to keep current)</span> : <span className="text-red-500">*</span>}
									</label>
									<input
										type="password"
										value={form.password}
										onChange={(e) => handleChange("password", e.target.value)}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
										placeholder="Min. 6 characters"
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
										Confirm Password {editingUser ? "" : <span className="text-red-500">*</span>}
									</label>
									<input
										type="password"
										value={form.confirmPassword}
										onChange={(e) => handleChange("confirmPassword", e.target.value)}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
										placeholder="••••••••"
									/>
								</div>
								<div className="col-span-2">
									<label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
										Role <span className="text-red-500">*</span>
									</label>
									<div className="flex gap-3">
										{ROLES.map((r) => (
											<label key={r} className="flex-1 cursor-pointer">
												<input
													type="radio"
													name="role"
													value={r}
													checked={form.role === r}
													onChange={() => handleChange("role", r)}
													className="peer sr-only"
												/>
												<div className={`text-center px-3 py-2.5 border rounded-xl font-semibold text-sm transition-all
													peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700
													border-slate-200 text-slate-500 hover:bg-slate-50`}>
													{r}
												</div>
											</label>
										))}
									</div>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm">
									Cancel
								</button>
								<button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center gap-2">
									{saving ? (
										<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{editingUser ? "Updating..." : "Creating..."}</>
									) : (editingUser ? "Update User" : "Create User")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && userToDelete && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
						<div className="bg-rose-50 px-8 py-6 text-center">
							<div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</div>
							<h3 className="text-xl font-bold text-slate-900">Delete User?</h3>
							<p className="text-slate-500 mt-2">
								Are you sure you want to delete <span className="font-bold text-slate-700">{userToDelete.name}</span>? This action cannot be undone.
							</p>
						</div>
						<div className="p-8 flex gap-3">
							<button
								onClick={() => setShowDeleteModal(false)}
								className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm"
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								disabled={deleting}
								className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-rose-500/20 transition-all text-sm flex items-center justify-center gap-2"
							>
								{deleting ? (
									<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
								) : "Delete User"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
