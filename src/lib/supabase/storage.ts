import { createClient } from "@/lib/supabase/client";
import { getFileHash, slugify } from "@/utils";

export async function uploadEquipmentImage(
	file: File,
	equipmentId: string,
	onProgress?: (progress: number) => void
): Promise<{ id: string; url: string }> {
	const supabase = createClient();

	// Get equipment title for folder naming
	const { data: equipmentData } = await supabase
		.from("equipment")
		.select("title")
		.eq("id", equipmentId)
		.single();

	const equipmentTitle = equipmentData?.title || "unknown";

	// We will use the file hash to check for duplicates
	const fileHash = await getFileHash(file);

	const uploadOptions = {
		upsert: true,
		contentType: file.type,
		onUploadProgress: (event: { loaded: number; total: number }) => {
			const percent = (event.loaded / event.total) * 100;
			if (onProgress) onProgress(Math.round(percent));
		},
	};

	// check if an image with the same hash already exists
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
		// if no duplicate, upload the file and create a new record
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
		// save the new image record in the database
		const { data: newImage, error: dbError } = await supabase
			.from("images")
			.insert({ url: publicUrl, hash: fileHash })
			.select("id")
			.single();

		if (dbError) throw dbError;
		targetImageId = newImage.id;
	}

	// link the image to the equipment (if not already linked)
	const { error: linkError } = await supabase
		.from("equipment_image_links")
		.upsert({ equipment_id: equipmentId, image_id: targetImageId });

	if (linkError) throw linkError;

	return { id: targetImageId, url: publicUrl };
}
