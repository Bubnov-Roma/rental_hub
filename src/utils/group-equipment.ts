import type {
	DbEquipmentWithImages,
	GroupedEquipment,
	SupabaseImage,
} from "@/core/domain/entities/Equipment";

// ─── Extract images ───────────────────────────────────────────────────────────

export function extractImages(item: DbEquipmentWithImages): SupabaseImage[] {
	if (!item.equipmentImageLinks || !Array.isArray(item.equipmentImageLinks))
		return [];

	return item.equipmentImageLinks
		.map((link) => link.image)
		.filter((img): img is SupabaseImage => Boolean(img?.url));
}

// ─── Group rows by title ──────────────────────────────────────────────────────

export function groupEquipmentRows(
	rows: DbEquipmentWithImages[]
): GroupedEquipment[] {
	const map = rows.reduce<Record<string, GroupedEquipment>>((acc, item) => {
		const title = item.title;
		const imagesData = extractImages(item);
		const imageUrls = imagesData.map((img) => img.url);

		if (!acc[title]) {
			acc[title] = {
				...item,
				description: item.description || "Нет описания",
				status: item.status,
				kit: item.kitDescription ?? null,
				imageUrl: imageUrls[0] || "/placeholder-equipment.png",
				images: imageUrls,
				imagesData: imagesData,
				rating: 5.0,
				reviewsCount: 0,
				specifications: item.specifications || {},
				totalCount: 0,
				availableCount: 0,
				allUnitIds: [],
				comments: item.comments || [],
				createdAt: new Date(item.createdAt),
				updatedAt: new Date(item.updatedAt),
			};
		}

		const group = acc[title];
		group.totalCount += 1;
		group.allUnitIds = [...group.allUnitIds, item.id];

		if (item.status === "AVAILABLE" && item.isAvailable) {
			group.availableCount += 1;
		}

		if (
			imageUrls.length > 0 &&
			(!group.imageUrl || group.imageUrl.includes("placeholder"))
		) {
			group.imageUrl = imageUrls[0] || "/placeholder-equipment.png";
			group.images = imageUrls;
			group.imagesData = imagesData;
		}

		return acc;
	}, {});

	return Object.values(map);
}
