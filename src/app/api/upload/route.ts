// Next.js Route Handler для загрузки файлов в Beget S3.
// Клиент делает POST /api/upload с FormData { file, folder? }
// и получает { url: "https://..." }

import { NextResponse } from "next/server";
import { uploadToS3 } from "@/actions/upload-actions";
import { auth } from "@/auth";

// В App Router лимит тела настраивается через route segment config:
export const maxDuration = 60; // секунд

const ALLOWED_MIME = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 МБ

export async function POST(req: Request) {
	try {
		// Только авторизованные
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await req.formData();
		const file = formData.get("file") as File | null;
		const folder = (formData.get("folder") as string | null) ?? "equipment";

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		if (!ALLOWED_MIME.has(file.type)) {
			return NextResponse.json(
				{ error: `Недопустимый тип файла: ${file.type}` },
				{ status: 400 }
			);
		}

		if (file.size > MAX_BYTES) {
			return NextResponse.json(
				{ error: "Файл слишком большой (максимум 10 МБ)" },
				{ status: 413 }
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const url = await uploadToS3(buffer, file.name, file.type, folder);

		return NextResponse.json({ url });
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Ошибка загрузки файла" },
			{ status: 500 }
		);
	}
}
