import type { GroupedEquipment } from "@/core/domain/entities/Equipment";

export interface EquipmentSet {
	id: string;
	name: string;
	description?: string;
	items: Array<{ equipment_id: string; quantity: number }>;
	total_price_per_day?: number;
	created_at: string;
	updated_at: string;
}

export interface FavoriteItem {
	id: string;
	equipment_id: string;
	equipment: GroupedEquipment & {
		equipment_image_links: Array<{ images: { url: string } }>;
	};
}
