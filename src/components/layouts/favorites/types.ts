import type { DbEquipmentWithImages } from "@/core/domain/entities/Equipment";

export interface EquipmentSet {
	id: string;
	name: string;
	description?: string | null;
	items: Array<{ equipmentId: string; quantity: number }> | null;
	totalPricePerDay?: number | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface FavoriteItem {
	id: string;
	equipmentId: string;
	equipment: DbEquipmentWithImages;
}
