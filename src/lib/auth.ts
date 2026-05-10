import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getCurrentUser() {
	const cookieStore = await cookies();
	const token = cookieStore.get("auth_token")?.value;

	if (!token) return null;

	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod"
		) as { userId: number; username: string; role: string };
		return decoded;
	} catch (error) {
		return null;
	}
}
