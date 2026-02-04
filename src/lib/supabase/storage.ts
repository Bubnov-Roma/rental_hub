import { createClient } from "@/lib/supabase/client";

export async function uploadEquipmentImage(file: File, equipmentId: string) {
	const supabase = createClient();

	// Uniq file name: id/timestamp.jpg
	const fileExt = file.name.split(".").pop();
	const fileName = `${equipmentId}/${Date.now()}.${fileExt}`;
	const filePath = `images/${fileName}`;

	// load file to 'equipment-images' bucket
	const { data: _uploadData, error: uploadError } = await supabase.storage
		.from("equipment-images")
		.upload(filePath, file, {
			upsert: true, // if file with same name exists, replace it
		});

	if (uploadError) throw uploadError;

	// Get public URL
	const {
		data: { publicUrl },
	} = supabase.storage.from("equipment-images").getPublicUrl(filePath);

	// Store public URL in 'images' table
	const { error: dbError } = await supabase.from("images").insert({
		equipment_id: equipmentId,
		url: publicUrl,
	});

	if (dbError) throw dbError;

	return publicUrl;
}
