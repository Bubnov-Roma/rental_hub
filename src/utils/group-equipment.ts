import type {
	DbEquipment,
	GroupedEquipment,
	OwnershipType,
	SupabaseImage,
} from "@/core/domain/entities/Equipment";

// ─── Raw row type ─────────────────────────────────────────────────────────────

export type RawEquipmentRow = DbEquipment & {
	equipment_image_links?: Array<{
		images: { id: string; url: string } | null;
	}>;
};

// ─── Extract images ───────────────────────────────────────────────────────────

export function extractImages(item: RawEquipmentRow): SupabaseImage[] {
	if (!item.equipment_image_links || !Array.isArray(item.equipment_image_links))
		return [];
	return item.equipment_image_links
		.map((link) => link.images)
		.filter((img): img is SupabaseImage => Boolean(img?.url));
}

// ─── Group rows by title ──────────────────────────────────────────────────────

export function groupEquipmentRows(
	rows: RawEquipmentRow[]
): GroupedEquipment[] {
	const map = rows.reduce<Record<string, GroupedEquipment>>((acc, item) => {
		const title = item.title;
		const imagesData = extractImages(item);
		const imageUrls = imagesData.map((img) => img.url);

		if (!acc[title]) {
			acc[title] = {
				...item,
				description: item.description || "Нет описания",
				ownership_type: item.ownership_type as OwnershipType,
				status: "available",
				kit: item.kit_description ?? null,
				related_ids: item.related_ids || [],
				imageUrl: imageUrls[0] || "/placeholder-equipment.png",
				images: imageUrls,
				images_data: imagesData,
				rating: 5.0,
				reviewsCount: 0,
				specifications: (item.specifications as Record<string, string>) || {},
				total_count: 0,
				available_count: 0,
				all_unit_ids: [],
				comments: item.comments || [],
			};
		}

		const group = acc[title];
		group.total_count += 1;
		group.all_unit_ids = [...group.all_unit_ids, item.id];

		if (item.status === "available" && item.is_available) {
			group.available_count += 1;
		}

		if (
			imageUrls.length > 0 &&
			(!group.imageUrl || group.imageUrl.includes("placeholder"))
		) {
			group.imageUrl = imageUrls[0] || "/placeholder-equipment.png";
			group.images = imageUrls;
			group.images_data = imagesData;
		}

		return acc;
	}, {});

	return Object.values(map);
}

// ─── Single row → GroupedEquipment (fallback when only one row available) ─────

export function singleRowToGrouped(item: RawEquipmentRow): GroupedEquipment {
	const imagesData = extractImages(item);
	const imageUrls = imagesData.map((img) => img.url);

	return {
		...item,
		description: item.description || "Нет описания",
		ownership_type: item.ownership_type as OwnershipType,
		status: "available",
		kit: item.kit_description ?? null,
		related_ids: item.related_ids || [],
		imageUrl: imageUrls[0] || "/placeholder-equipment.png",
		images: imageUrls,
		images_data: imagesData,
		rating: 5.0,
		reviewsCount: 0,
		specifications: (item.specifications as Record<string, string>) || {},
		total_count: 1,
		available_count: item.is_available ? 1 : 0,
		all_unit_ids: [item.id],
		comments: item.comments || [],
	};
}
