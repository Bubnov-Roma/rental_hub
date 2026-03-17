/**
 * Equipment сущности и типы
 *
 * Иерархия:
 * DbEquipmentBase — базовые поля из БД
 * ├─ DbEquipment — для простых операций без relations
 * └─ DbEquipmentWithImages — для edit-режима с equipmentImageLinks relation
 *
 * RawEquipmentRow — raw Prisma result (с flattened relations)
 * GroupedEquipment — для каталога (с агрегацией)
 */

export type EquipmentStatus =
	| "AVAILABLE"
	| "RENTED"
	| "RESERVED"
	| "MAINTENANCE"
	| "BROKEN"
	| "RETIRED";
export type OwnershipType = "INTERNAL" | "SUBLEASE";

export interface SupabaseImage {
	id: string;
	url: string;
}

export interface Comment {
	id: string;
	text: string;
	author: string;
	createdAt: string;
}

export interface DbEquipmentBase {
	id: string;
	title: string;
	description: string | null;
	categoryId: string;
	subcategoryId: string | null;
	inventoryNumber: string | null;
	pricePerDay: number;
	price4h: number;
	price8h: number;
	deposit: number;
	replacementValue: number;
	isAvailable: boolean;
	isPrimary: boolean;
	status: EquipmentStatus;
	ownershipType: OwnershipType;
	partnerName: string | null;
	defects: string | null;
	kit: string | null;
	kitDescription: string | null;
	specifications: Record<string, unknown>;
	comments: Comment[];
	slug: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface DbEquipment extends DbEquipmentBase {
	// relatedIds хранится в другой таблице EquipmentRelation, не в Equipment
}

/** DbEquipmentWithImages — оснащен equipmentImageLinks relation для edit-режима */
export interface DbEquipmentWithImages extends DbEquipmentBase {
	equipmentImageLinks: EquipmentImageLinkWithImage[];
}

/** Link между Equipment и Image с полной информацией */
export interface EquipmentImageLinkWithImage {
	id: string;
	equipmentId: string;
	imageId: string;
	image: {
		id: string;
		url: string;
	};
	orderIndex: number;
}

/**
 * RawEquipmentRow — результат findMany из Prisma с include equipmentImageLinks
 * Структура совпадает с DbEquipmentWithImages
 */
export type RawEquipmentRow = DbEquipmentWithImages;

export interface GroupedEquipment
	extends Omit<DbEquipment, "createdAt" | "updatedAt"> {
	createdAt: Date;
	updatedAt: Date;
	totalCount: number;
	availableCount: number;
	imagesData: SupabaseImage[];
	allUnitIds: string[];
	imageUrl: string;
	images: string[];
	rating: number;
	reviewsCount: number;
	equipmentImageLinks: EquipmentImageLinkWithImage[];
}

// ─── DB-driven category types ─────────────────────────────────────────────────
// Категории и подкатегории приходят из базы данных.
// Администратор/менеджер добавляет их через admin-панель → они автоматически появляются в меню навигации без деплоя.
//

export type DbSubcategory = {
	id: string;
	name: string;
	slug: string;
	adminNotes?: string | undefined;
	imageUrl?: string | undefined;
};

export type DbCategory = {
	id: string;
	name: string;
	slug: string;
	adminNotes?: string | undefined;
	isModular: boolean;
	imageUrl?: string | undefined;
	/** Имя иконки из Phosphor Icons (строка), маппится в компоненте */
	iconName: string;
	subcategories: DbSubcategory[];
};
