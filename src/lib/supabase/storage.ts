import { createClient } from "@/lib/supabase/client";
import { getFileHash, slugify } from "@/utils";

// ── Avatar upload ─────────────────────────────────────────────────────────────
// Bucket: "avatars" — public bucket, one file per user (keyed by user id).
// RLS policy:
//   CREATE POLICY "avatar_upload" ON storage.objects FOR INSERT
//     WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
//   CREATE POLICY "avatar_update" ON storage.objects FOR UPDATE
//     WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

export async function uploadAvatarImage(file: File): Promise<string> {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error("Не авторизован");

	const ext = file.name.split(".").pop() ?? "webp";
	// Store as <user_id>/<user_id>.<ext> so RLS folder check passes
	const filePath = `${user.id}/${user.id}.${ext}`;

	const { error: uploadError } = await supabase.storage
		.from("avatars")
		.upload(filePath, file, {
			upsert: true,
			contentType: file.type,
		});

	if (uploadError) throw uploadError;

	const {
		data: { publicUrl },
	} = supabase.storage.from("avatars").getPublicUrl(filePath);

	// Bust CDN cache by appending a timestamp query param
	const bustUrl = `${publicUrl}?t=${Date.now()}`;

	// Persist to auth metadata and profiles table in parallel
	await Promise.all([
		supabase.auth.updateUser({ data: { avatar_url: bustUrl } }),
		supabase.from("profiles").update({ avatar_url: bustUrl }).eq("id", user.id),
	]);

	return bustUrl;
}

// ── Equipment image upload ────────────────────────────────────────────────────

export async function uploadEquipmentImage(
	file: File,
	equipmentId: string,
	onProgress?: (progress: number) => void
): Promise<{ id: string; url: string }> {
	const supabase = createClient();

	const { data: equipmentData } = await supabase
		.from("equipment")
		.select("title")
		.eq("id", equipmentId)
		.single();

	const equipmentTitle = equipmentData?.title || "unknown";
	const fileHash = await getFileHash(file);

	const uploadOptions = {
		upsert: true,
		contentType: file.type,
		onUploadProgress: (event: { loaded: number; total: number }) => {
			const percent = (event.loaded / event.total) * 100;
			if (onProgress) onProgress(Math.round(percent));
		},
	};

	const { data: existingImage } = await supabase
		.from("images")
		.select("id, url")
		.eq("hash", fileHash)
		.single();

	let targetImageId: string;
	let publicUrl: string;

	if (existingImage) {
		targetImageId = existingImage.id;
		publicUrl = existingImage.url;
		if (onProgress) onProgress(100);
	} else {
		const folderName = slugify(equipmentTitle);
		const fileExt = file.name.split(".").pop();
		const fileName = `${fileHash}.${fileExt}`;
		const filePath = `images/${folderName}/${fileName}`;

		const { error: uploadError } = await supabase.storage
			.from("equipment-images")
			.upload(filePath, file, uploadOptions);

		if (uploadError) throw uploadError;

		const {
			data: { publicUrl: url },
		} = supabase.storage.from("equipment-images").getPublicUrl(filePath);

		publicUrl = url;
		const { data: newImage, error: dbError } = await supabase
			.from("images")
			.insert({ url: publicUrl, hash: fileHash })
			.select("id")
			.single();

		if (dbError) throw dbError;
		targetImageId = newImage.id;
	}

	const { error: linkError } = await supabase
		.from("equipment_image_links")
		.upsert({ equipment_id: equipmentId, image_id: targetImageId });

	if (linkError) throw linkError;

	return { id: targetImageId, url: publicUrl };
}
