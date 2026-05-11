"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

type User = {
	id: number;
	name: string;
	username: string;
	role: string;
	createdAt: string;
	departmentId?: number | null;
	department?: { name: string } | null;
};

type Department = {
	id: number;
	name: string;
};

const ROLES = ["Admin", "CEO", "Head", "Lab Manager", "Engineer", "Inspector", "Requester"];

const ROLE_STYLE: Record<string, string> = {
	Admin: "bg-black text-white border-black",
	CEO: "bg-blue-600 text-white border-blue-700 shadow-sm",
	Head: "bg-violet-100 text-violet-700 border-violet-200",
	"Lab Manager": "bg-blue-100 text-blue-700 border-blue-200",
	Engineer: "bg-emerald-100 text-emerald-700 border-emerald-200",
	Inspector: "bg-indigo-100 text-indigo-700 border-indigo-200",
	Requester: "bg-amber-100 text-amber-700 border-amber-200",
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
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	const [search, setSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [deptFilter, setDeptFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const [form, setForm] = useState({
		name: "",
		username: "",
		password: "",
		confirmPassword: "",
		role: "Requester",
		departmentId: "",
	});

	const filteredUsers = useMemo(() => {
		return users.filter(u => {
			const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
				u.username.toLowerCase().includes(search.toLowerCase());
			const matchesRole = !roleFilter || u.role === roleFilter;
			const matchesDept = !deptFilter || u.departmentId?.toString() === deptFilter;
			return matchesSearch && matchesRole && matchesDept;
		});
	}, [users, search, roleFilter, deptFilter]);

	const paginatedUsers = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return filteredUsers.slice(start, start + itemsPerPage);
	}, [filteredUsers, currentPage]);

	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

	useEffect(() => { setCurrentPage(1); }, [search, roleFilter, deptFilter]);

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

	const fetchDepartments = useCallback(async () => {
		try {
			const res = await fetch("/api/master-data/departments");
			if (res.ok) setDepartments(await res.json());
		} catch {
			// silently fail
		}
	}, []);

	useEffect(() => {
		fetchUsers();
		fetchDepartments();
	}, [fetchUsers, fetchDepartments]);

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
				departmentId: user.departmentId?.toString() || "",
			});
		} else {
			setEditingUser(null);
			setForm({ name: "", username: "", password: "", confirmPassword: "", role: "Requester", departmentId: "" });
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
		if (!["Admin", "CEO"].includes(form.role) && !form.departmentId) {
			setError(`The '${form.role}' role requires a department assignment.`);
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
					departmentId: form.departmentId ? parseInt(form.departmentId) : null,
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

	const hasSuperAdmin = users.some(u => u.role === "Admin");

	return (
		<div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
			{/* Header */}
			<div className="flex justify-between items-end mb-8">
				<div>
					<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h2>
					<p className="text-slate-500 mt-1 font-medium">
						Manage staff access across departments and technical roles.
					</p>
				</div>
				<button
					onClick={() => openModal()}
					className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
					</svg>
					Add New User
				</button>
			</div>

			{success && (
				<div className="mb-6 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm border border-emerald-100 flex items-center gap-2 font-medium">
					<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					{success}
				</div>
			)}

			{/* Stats */}
			<div className="grid grid-cols-3 gap-6 mb-8">
				{[
					{ label: "Active Directory", value: users.length, color: "bg-slate-50 text-slate-600" },
					{ label: "Administrative Staff", value: users.filter((u) => ["Admin", "Head", "Lab Manager"].includes(u.role)).length, color: "bg-violet-50 text-violet-600" },
					{ label: "Technical Staff", value: users.filter((u) => !["Admin", "Head", "Lab Manager"].includes(u.role)).length, color: "bg-blue-50 text-blue-600" },
				].map((stat) => (
					<div key={stat.label} className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6">
						<p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
						<p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
					</div>
				))}
			</div>

			{/* User Table */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
				<div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
						<span className="font-bold text-slate-700 text-sm">{filteredUsers.length} MEMBERS FOUND</span>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<div className="relative">
							<svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search name or user..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/10 outline-none w-64 transition-all"
							/>
						</div>

						<select
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
							className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10"
						>
							<option value="">All Roles</option>
							{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
						</select>

						<select
							value={deptFilter}
							onChange={(e) => setDeptFilter(e.target.value)}
							className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 max-w-[150px]"
						>
							<option value="">All Departments</option>
							{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
						</select>

						{(search || roleFilter || deptFilter) && (
							<button
								onClick={() => { setSearch(""); setRoleFilter(""); setDeptFilter(""); }}
								className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
							>
								Clear
							</button>
						)}
					</div>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider">
								<th className="px-6 py-4 font-bold border-b border-slate-200">Staff Member</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Department</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200">Role</th>
								<th className="px-6 py-4 font-bold border-b border-slate-200 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								[...Array(4)].map((_, i) => (
									<tr key={i} className="animate-pulse">
										<td colSpan={4} className="px-6 py-8" />
									</tr>
								))
							) : filteredUsers.length === 0 ? (
								<tr>
									<td colSpan={4} className="px-6 py-20 text-center">
										<div className="flex flex-col items-center gap-3 opacity-30">
											<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
											</svg>
											<p className="font-bold text-slate-500 uppercase tracking-widest text-xs">No users match your filters</p>
										</div>
									</td>
								</tr>
							) : (
								paginatedUsers.map((user, idx) => (
									<tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className={`w-10 h-10 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
													{user.name.charAt(0).toUpperCase()}
												</div>
												<div>
													<p className="font-semibold text-slate-800">{user.name}</p>
													<p className="text-xs text-slate-500">@{user.username}</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="text-sm font-medium text-slate-600">
												{user.department?.name || (["Admin", "CEO"].includes(user.role) ? "N/A" : "UNASSIGNED")}
											</span>
										</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${ROLE_STYLE[user.role] ?? ROLE_STYLE.OPERATOR}`}>
												{user.role}
											</span>
										</td>
										<td className="px-6 py-4 text-right">
											<div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

				{/* Pagination Footer */}
				{totalPages > 1 && (
					<div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
						<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
							Page {currentPage} of {totalPages}
						</p>
						<div className="flex gap-2">
							<button
								disabled={currentPage === 1}
								onClick={() => setCurrentPage(p => p - 1)}
								className="px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors"
							>
								Previous
							</button>
							<button
								disabled={currentPage === totalPages}
								onClick={() => setCurrentPage(p => p + 1)}
								className="px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest bg-white disabled:opacity-30 hover:bg-slate-50 transition-colors"
							>
								Next
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Add User Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
						<div className="bg-slate-900 px-8 py-5 flex justify-between items-center rounded-t-3xl sticky top-0 z-10">
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

							<div className="grid grid-cols-2 gap-5">
								<div className="col-span-2">
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Full Name <span className="text-red-500">*</span></label>
									<input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} autoFocus className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. Ramesh Kumar" />
								</div>
								<div className="col-span-2">
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Username <span className="text-red-500">*</span></label>
									<input type="text" value={form.username} onChange={(e) => handleChange("username", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="e.g. ramesh.kumar" />
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Access Role <span className="text-red-500">*</span></label>
									<select value={form.role} onChange={(e) => handleChange("role", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm">
										{ROLES.map(r => (
											<option
												key={r}
												value={r}
												disabled={r === "Admin" && hasSuperAdmin && editingUser?.role !== "Admin"}
											>
												{r} {r === "Admin" && hasSuperAdmin && editingUser?.role !== "Admin" ? "(Only one allowed)" : ""}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className={`block text-sm font-semibold ${["Admin", "CEO"].includes(form.role) ? "text-slate-400" : "text-slate-700"} mb-1.5 ml-1`}>
										Department {!["Admin", "CEO"].includes(form.role) && <span className="text-red-500">*</span>}
									</label>
									<select
										value={form.departmentId}
										disabled={["Admin", "CEO"].includes(form.role)}
										onChange={(e) => handleChange("departmentId", e.target.value)}
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm disabled:opacity-50"
									>
										<option value="">Select Department</option>
										{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
									</select>
								</div>

								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password {editingUser && <span className="text-slate-400 font-normal">(Leave blank to keep)</span>}</label>
									<input type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="••••••••" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
									<input type="password" value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" placeholder="••••••••" />
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-2">
								<button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all text-sm">Cancel</button>
								<button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm flex items-center gap-2">
									{saving ? "Saving..." : (editingUser ? "Update User" : "Create User")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && userToDelete && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
					<div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in fade-in zoom-in-95 duration-200 text-center">
						<div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-5">
							<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
						</div>
						<h3 className="text-lg font-bold text-slate-900 mb-2">Delete User?</h3>
						<p className="text-sm text-slate-500 mb-6 px-4">
							Are you sure you want to remove <span className="font-bold text-slate-700">@{userToDelete.username}</span>?
						</p>
						<div className="flex gap-3">
							<button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 text-sm">Cancel</button>
							<button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm">Delete</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
