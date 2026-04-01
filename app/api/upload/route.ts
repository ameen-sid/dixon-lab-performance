export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import prisma from "@/src/lib/prisma";

export async function POST(req: Request) {
	try {
		// 1. Parse the incoming multipart form data
		const data = await req.formData();
		const file: File | null = data.get("file") as unknown as File;
		const functionalTestId = data.get("functionalTestId");

		if (!file || !functionalTestId) {
			return NextResponse.json(
				{ error: "A file and a valid functionalTestId are required." },
				{ status: 400 },
			);
		}

		// 2. Convert the file into a Node.js Buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// 3. Define the file path (saving to the public/uploads folder)
		const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
		const uploadDir = path.join(process.cwd(), "public", "uploads");

		// Auto-create the uploads directory if it doesn't exist
		await mkdir(uploadDir, { recursive: true });

		const filepath = path.join(uploadDir, filename);

		// Write the file to the local filesystem
		await writeFile(filepath, buffer);

		// 4. Save the image URL reference to the database
		const newImageRecord = await prisma.testImage.create({
			data: {
				imageUrl: `/uploads/${filename}`,
				functionalTestId: parseInt(functionalTestId as string),
			},
		});

		return NextResponse.json(newImageRecord, { status: 201 });
	} catch (error) {
		console.error("Error uploading image:", error);
		return NextResponse.json(
			{ error: "Failed to upload image" },
			{ status: 500 },
		);
	}
}
