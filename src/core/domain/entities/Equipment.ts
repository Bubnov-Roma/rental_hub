export type EquipmentStatus =
	| "available"
	| "rented"
	| "reserved"
	| "maintenance"
	| "broken";

export type OwnershipType = "internal" | "sublease";

export interface SupabaseImage {
	id: string;
	url: string;
}

export interface SupabaseLink {
	images: SupabaseImage | null;
	image_id?: string;
}

export type Filters = {
	categorySlug?: string;
	search?: string;
};

export interface Comment {
	id: string;
	text: string;
	author: string;
	created_at: string;
}

export interface Equipment {
	readonly id: string;
	readonly title: string;
	readonly description: string | null;
	readonly category: string;
	readonly subcategory: string | null;
	readonly inventory_number: string | null;
	readonly price_per_day: number;
	readonly price_4h: number;
	readonly price_8h: number;
	readonly deposit: number;
	readonly replacement_value: number;
	readonly is_available: boolean;
	readonly status: EquipmentStatus;
	readonly ownership_type: OwnershipType;
	readonly partner_name: string | null;
	readonly defects: string | null;
	readonly kit: string | null;
	readonly kit_description?: string | null;
	readonly related_ids: string[];
	readonly specifications: string | Record<string, unknown>;
	readonly comments?: Comment[];
	readonly slug: string;
	imageUrl: string;
	images: string[];
	images_data?: SupabaseImage[];
	rating: number;
	reviewsCount: number;
	readonly created_at: string;
	readonly updated_at: string;
}

export interface GroupedEquipment extends Equipment {
	total_count: number;
	available_count: number;
	images_data: SupabaseImage[];
	all_unit_ids: string[];
}

export interface EquipmentImage {
	readonly id: string;
	readonly equipment_id: string;
	readonly url: string;
	readonly order_index: number;
}

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
	readonly kit_description?: string;
	readonly related_ids?: string[];
	readonly specifications: Record<string, unknown>;
	readonly comments?: Comment[];
	readonly images?: File[];
}

export interface DbEquipment {
	id: string;
	title: string;
	description: string | null;
	category: string;
	subcategory: string | null;
	inventory_number: string | null;
	price_per_day: number;
	price_4h: number;
	price_8h: number;
	deposit: number;
	replacement_value: number;
	is_available: boolean;
	status: EquipmentStatus;
	ownership_type: string;
	partner_name: string | null;
	defects: string | null;
	kit: string | null;
	kit_description: string | null;
	related_ids: string[] | null;
	specifications: Record<string, unknown> | null;
	comments: Comment[] | null;
	equipment_image_links: SupabaseLink[];
	images_data: SupabaseImage[];
	slug: string;
	created_at: string;
	updated_at: string;
}
