export interface Equipment {
	imageUrl: string;
	rating: number;
	reviewsCount: number;
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly category: string;
	readonly price_per_day: number;
	readonly is_available: boolean;
	readonly specifications: string;
	readonly created_at: string;
	readonly updated_at: string;
}

export interface EquipmentImage {
	readonly id: string;
	readonly equipment_id: string;
	readonly url: string;
	readonly order_index: number;
}

export interface CreateEquipmentDTO<T = unknown> {
	readonly title: string;
	readonly description: string;
	readonly category: string;
	readonly price_per_day: number;
	readonly specifications: Record<string, T>;
	readonly images?: File[];
}
