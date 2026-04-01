import { NextResponse } from "next/server";

export async function POST() {
	const response = NextResponse.json(
		{ message: "Logged out successfully" },
		{ status: 200 },
	);

	// Clear the cookie by overwriting it with a blank value and an expired date
	response.cookies.set({
		name: "auth_token",
		value: "",
		httpOnly: true,
		expires: new Date(0), // Sets expiration to the past
		path: "/",
	});

	return response;
}
