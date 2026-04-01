/** @type {import('next').NextConfig} */
const nextConfig = {
	// This tells Next.js NOT to bundle these backend libraries
	serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
