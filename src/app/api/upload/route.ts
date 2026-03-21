import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { uuidv4 } from "zod";
import { auth } from "@/auth";

export async function POST(request: Request) {
	try {
		const session = await auth();
		if (!session?.user?.id)
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const formData = await request.formData();
		const file = formData.get("file") as File | null;
		const folder = (formData.get("folder") as string) || "misc"; // e.g., 'avatars' or 'equipment'

		if (!file)
			return NextResponse.json({ error: "No file provided" }, { status: 400 });

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		const ext = file.name.split(".").pop() || "bin";
		const filename = `${uuidv4()}.${ext}`;

		const uploadDir = join(process.cwd(), "public", "uploads", folder);

		await mkdir(uploadDir, { recursive: true });

		const filePath = join(uploadDir, filename);

		await writeFile(filePath, buffer);

		const publicUrl = `/uploads/${folder}/${filename}`;

		return NextResponse.json({ url: publicUrl, success: true });
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
