export type EquipmentStatus = "available" | "rented" | "reserved" | "broken";
export type OwnershipType = "internal" | "sublease";

export interface Equipment {
	readonly id: string;
	readonly title: string;
	readonly description: string | null;
	readonly category: string;
	readonly subcategory: string | null;
	readonly inventory_number: string | null;

	// Prices
	readonly price_per_day: number;
	readonly price_4h: number;
	readonly price_8h: number;
	readonly deposit: number;
	readonly replacement_value: number;

	// Status and ownership
	readonly status: EquipmentStatus;
	readonly is_available: boolean;
	readonly ownership_type: OwnershipType;
	readonly partner_name: string | null;

	// Additional info
	readonly defects: string | null;
	readonly kit: string | null;
	readonly related_ids: string[];

	// Media
	imageUrl: string;
	images: string[];
	rating: number;
	reviewsCount: number;

	readonly specifications: string | Record<string, unknown>;

	readonly created_at: string;
	readonly updated_at: string;
}

export interface EquipmentImage {
	readonly id: string;
	readonly equipment_id: string;
	readonly url: string;
	readonly order_index: number;
}

/**
 * DTO for create/update (Admin Panel)
 * Adding new fields so that they can be saved via the form
 */
export interface CreateEquipmentDTO {
	readonly title: string;
	readonly description?: string;
	readonly category: string;
	readonly subcategory?: string;
	readonly inventory_number?: string;

	readonly price_per_day: number;
	readonly price_4h: number;
	readonly price_8h: number;
	readonly deposit: number;
	readonly replacement_value: number;

	readonly status: EquipmentStatus;
	readonly ownership_type: OwnershipType;
	readonly partner_name?: string;

	readonly defects?: string;
	readonly kit?: string;
	readonly related_ids?: string[];

	readonly specifications: Record<string, unknown>;
	readonly images?: File[];
}
