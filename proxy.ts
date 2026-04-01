import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
	// Grab the cookie that was set during login
	const token = req.cookies.get("auth_token")?.value;

	// Define the main paths that should be locked down
	const protectedPaths = ["/dashboard", "/reports", "/master-data"];
	const isProtectedRoute = protectedPaths.some((path) =>
		req.nextUrl.pathname.startsWith(path),
	);

	// If the route is protected and the user has no token, kick them to login
	if (isProtectedRoute && !token) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	// If the user IS logged in but tries to go to the login page, send them to the dashboard
	if (req.nextUrl.pathname === "/login" && token) {
		return NextResponse.redirect(new URL("/dashboard", req.url)); // Or '/' depending on your setup
	}

	return NextResponse.next();
}

// The matcher tells Next.js exactly which routes this middleware should run on
export const config = {
	matcher: [
		"/dashboard/:path*",
		"/reports/:path*",
		"/master-data/:path*",
		"/login",
	],
};
