"use server";

import type { EquipmentStatus, OwnershipType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import type {
	DbEquipment,
	DbEquipmentWithImages,
	GroupedEquipment,
	RawEquipmentRow,
} from "@/core/domain/entities/Equipment";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/utils";
import { groupEquipmentRows } from "@/utils/group-equipment";

// ─── TYPES & HELPERS ────────────────────────────────────────────────────────

export type CreateEquipmentData = {
	title: string;
	categoryId: string;
	subcategoryId?: string | null;
	inventoryNumber?: string | undefined;
	pricePerDay: number;
	price4h?: number | undefined;
	price8h?: number | undefined;
	deposit?: number | undefined;
	replacementValue?: number | undefined;
	description?: string | undefined;
	kitDescription?: string | undefined;
	defects?: string | undefined;
	status?: EquipmentStatus | undefined;
	isAvailable?: boolean | undefined;
	ownershipType?: OwnershipType | undefined;
	partnerName?: string | undefined;
	specifications?: Record<string, unknown>;
	relatedIds?: string[] | undefined;
};

export type FilterOperator =
	| "eq"
	| "neq"
	| "gt"
	| "gte"
	| "lt"
	| "lte"
	| "like"
	| "ilike"
	| "in"
	| "is"
	| "contains";

export type EquipmentColumn = keyof Prisma.EquipmentWhereInput;

export type EquipmentFilter = {
	column: EquipmentColumn;
	operator: FilterOperator;
	value: unknown;
};

export type EquipmentSort = {
	column: keyof Prisma.EquipmentOrderByWithRelationInput;
	ascending: boolean;
};

function buildPrismaWhere(
	filters?: EquipmentFilter[],
	search?: string
): Prisma.EquipmentWhereInput {
	const where: Prisma.EquipmentWhereInput = {};

	if (search) {
		where.OR = [
			{ title: { contains: search } },
			{ description: { contains: search } },
			{ inventoryNumber: { contains: search } },
		];
	}

	if (filters && filters.length > 0) {
		const dynamicConditions = filters.reduce(
			(acc, { column, operator, value }) => {
				switch (operator) {
					case "eq":
					case "is":
						acc[column as string] = value;
						break;
					case "neq":
						acc[column as string] = { not: value };
						break;
					case "gt":
						acc[column as string] = { gt: value };
						break;
					case "gte":
						acc[column as string] = { gte: value };
						break;
					case "lt":
						acc[column as string] = { lt: value };
						break;
					case "lte":
						acc[column as string] = { lte: value };
						break;
					case "like":
					case "ilike":
					case "contains":
						acc[column as string] = {
							contains: String(value),
							mode: "insensitive",
						};
						break;
					case "in":
						acc[column as string] = {
							in: Array.isArray(value) ? value : [value],
						};
						break;
				}
				return acc;
			},
			{} as Record<string, unknown>
		);
		return { ...where, ...dynamicConditions } as Prisma.EquipmentWhereInput;
	}

	return where;
}

// ─── ACTIONS ────────────────────────────────────────────────────────────────

export async function createEquipmentAction(
	data: CreateEquipmentData
): Promise<{ success: boolean; id?: string; error?: string }> {
	try {
		const created = await prisma.equipment.create({
			data: {
				title: data.title,
				slug: slugify(data.title),
				categoryId: data.categoryId,
				subcategoryId: data.subcategoryId ?? null,
				inventoryNumber: data.inventoryNumber ?? null,
				pricePerDay: data.pricePerDay,
				price4h: data.price4h ?? 0,
				price8h: data.price8h ?? 0,
				deposit: data.deposit ?? 0,
				replacementValue: data.replacementValue ?? 0,
				description: data.description ?? null,
				kitDescription: data.kitDescription ?? null,
				defects: data.defects ?? null,
				status: data.status ?? "AVAILABLE",
				isAvailable: data.isAvailable ?? true,
				ownershipType: data.ownershipType ?? "INTERNAL",
				partnerName: data.partnerName ?? null,
				// Строгое приведение к JSON-формату Prisma
				specifications: data.specifications
					? (data.specifications as Prisma.InputJsonValue)
					: Prisma.JsonNull,
				// Условный спред: ключ relatedEquipment добавится в объект только если есть id
				...(data.relatedIds && data.relatedIds.length > 0
					? {
							relatedEquipment: {
								create: data.relatedIds.map((id) => ({
									relatedId: id,
								})),
							},
						}
					: {}),
			},
		});

		revalidatePath("/admin/equipment");
		return { success: true, id: created.id };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Неизвестная ошибка" };
	}
}

export async function getEquipmentWithFilters(params: {
	search?: string;
	filters?: EquipmentFilter[];
	sort?: EquipmentSort[];
	limit?: number;
	offset?: number;
}): Promise<{ data: DbEquipmentWithImages[]; count: number }> {
	const where = buildPrismaWhere(params.filters, params.search);

	const orderBy = params.sort?.length
		? params.sort.map((s) => ({ [s.column]: s.ascending ? "asc" : "desc" }))
		: [{ createdAt: "desc" }];

	const queryArgs: Prisma.EquipmentFindManyArgs = {
		where,
		orderBy: orderBy as Prisma.EquipmentOrderByWithRelationInput[],
		include: {
			equipmentImageLinks: {
				include: { image: { select: { id: true, url: true } } },
				orderBy: { orderIndex: "asc" },
			},
		},
	};

	// Добавляем лимиты только если они есть (решает проблему exactOptionalPropertyTypes)
	if (params.limit !== undefined) queryArgs.take = params.limit;
	if (params.offset !== undefined) queryArgs.skip = params.offset;

	const [data, count] = await Promise.all([
		prisma.equipment.findMany(queryArgs),
		prisma.equipment.count({ where }),
	]);

	return {
		data: data as unknown as DbEquipmentWithImages[],
		count,
	};
}

export async function updateEquipment(
	id: string,
	updates: Partial<DbEquipment>
): Promise<DbEquipment> {
	const withSlug = updates.title
		? { ...updates, slug: slugify(updates.title) }
		: updates;

	const cleanUpdates = Object.fromEntries(
		Object.entries(withSlug).filter(([, v]) => v !== undefined)
	);

	const updated = await prisma.equipment.update({
		where: { id },
		data: cleanUpdates,
	});

	revalidatePath("/admin/equipment");
	return updated as unknown as DbEquipment;
}

export async function deleteEquipment(ids: string[]) {
	const referencedItems = await prisma.bookingItem.findMany({
		where: {
			equipmentId: { in: ids },
			booking: { status: { not: "CANCELLED" } },
		},
		select: { equipmentId: true },
	});

	if (referencedItems.length > 0) {
		const refIds = [...new Set(referencedItems.map((r) => r.equipmentId))];
		const freeIds = ids.filter((id) => !refIds.includes(id));

		if (freeIds.length > 0) {
			await prisma.equipment.deleteMany({ where: { id: { in: freeIds } } });
		}

		await prisma.equipment.updateMany({
			where: { id: { in: refIds } },
			data: { isAvailable: false, status: "BROKEN" },
		});

		revalidatePath("/admin/equipment");
		return {
			success: true,
			partial: true,
			deleted: freeIds.length,
			archived: refIds.length,
			archivedIds: refIds,
			message: `Удалено: ${freeIds.length}. Архивировано (есть в бронях): ${refIds.length}.`,
		};
	}

	await prisma.equipment.deleteMany({ where: { id: { in: ids } } });

	revalidatePath("/admin/equipment");
	return { success: true };
}

export async function setPrimaryEquipmentAction(id: string) {
	const item = await prisma.equipment.findUnique({
		where: { id },
		select: { title: true },
	});

	if (!item) return { success: false, error: "Позиция не найдена" };

	await prisma.$transaction([
		prisma.equipment.updateMany({
			where: { title: item.title },
			data: { isPrimary: false },
		}),
		prisma.equipment.update({
			where: { id },
			data: { isPrimary: true },
		}),
	]);

	revalidatePath("/admin/equipment");
	return { success: true };
}

export async function searchEquipmentAction(
	query: string
): Promise<GroupedEquipment[]> {
	if (!query || query.length < 2) return [];

	const data = await prisma.equipment.findMany({
		where: {
			isAvailable: true,
			title: { contains: query },
		},
		take: 10,
		include: {
			equipmentImageLinks: {
				include: { image: true },
				orderBy: { orderIndex: "asc" },
			},
		},
	});

	return groupEquipmentRows(data as unknown as RawEquipmentRow[]);
}

export async function duplicateEquipment(id: string): Promise<DbEquipment> {
	const original = await prisma.equipment.findUnique({
		where: { id },
		include: { equipmentImageLinks: true },
	});

	if (!original) throw new Error("Equipment not found");

	const baseNumber = original.inventoryNumber || "COPY";
	const existing = await prisma.equipment.findMany({
		where: { inventoryNumber: { startsWith: baseNumber } },
		select: { inventoryNumber: true },
		orderBy: { inventoryNumber: "desc" },
	});

	let nextIdx = 1;
	if (existing.length > 0) {
		const numbers = existing.map((e) => {
			const m = e.inventoryNumber?.match(/-(\d+)$/);
			if (m?.[1]) {
				return parseInt(m[1], 10);
			}
			return 0;
		});
		nextIdx = Math.max(...numbers, 0) + 1;
	}
	const newInventoryNumber = `${baseNumber}-${nextIdx}`;

	const {
		id: _,
		createdAt: __,
		updatedAt: ___,
		equipmentImageLinks,
		specifications,
		comments,
		...data
	} = original;

	const newEntry = await prisma.equipment.create({
		data: {
			...data,
			inventoryNumber: newInventoryNumber,
			slug: slugify(`${data.title}-${newInventoryNumber}`),
			// Строгий каст JSON для записи или установка null
			specifications: specifications
				? (specifications as Prisma.InputJsonValue)
				: Prisma.JsonNull,
			comments: comments
				? (comments as Prisma.InputJsonValue)
				: Prisma.JsonNull,
			equipmentImageLinks: {
				create: equipmentImageLinks.map((link) => ({
					imageId: link.imageId,
					orderIndex: link.orderIndex,
				})),
			},
		},
	});

	revalidatePath("/admin/equipment");
	return newEntry as unknown as DbEquipment;
}

export async function syncEquipmentByTitle(
	targetId: string,
	fields: string[]
): Promise<{ updated: number }> {
	const source = await prisma.equipment.findUnique({ where: { id: targetId } });
	if (!source) throw new Error("Source not found");

	const siblings = await prisma.equipment.findMany({
		where: { title: source.title, id: { not: targetId } },
		select: { id: true },
	});

	if (siblings.length === 0) return { updated: 0 };

	const updateData: Record<string, unknown> = {};
	for (const field of fields) {
		if (
			field !== "id" &&
			field !== "createdAt" &&
			field !== "updatedAt" &&
			field !== "inventoryNumber"
		) {
			updateData[field] = (source as unknown as Record<string, unknown>)[field];
		}
	}

	await prisma.equipment.updateMany({
		where: { id: { in: siblings.map((s) => s.id) } },
		data: updateData,
	});

	revalidatePath("/admin/equipment");
	return { updated: siblings.length };
}

export async function exportEquipment(ids?: string[]): Promise<DbEquipment[]> {
	const data = await prisma.equipment.findMany({
		where: ids && ids.length > 0 ? { id: { in: ids } } : {},
	});
	return data as unknown as DbEquipment[];
}

export async function getEquipmentById(
	id: string
): Promise<DbEquipmentWithImages | null> {
	const data = await prisma.equipment.findUnique({
		where: { id },
		include: {
			equipmentImageLinks: {
				include: { image: { select: { id: true, url: true } } },
				orderBy: { orderIndex: "asc" },
			},
		},
	});

	return (data as unknown as DbEquipmentWithImages) || null;
}

// ─── CATALOG FETCH (Cached) ─────────────────────────────────────────────────

const fetchEquipmentCached = cache(
	async (
		categorySlug: string,
		subcategorySlug: string,
		search: string
	): Promise<GroupedEquipment[]> => {
		const where: Prisma.EquipmentWhereInput = { isAvailable: true };

		if (search) {
			where.title = { contains: search };
		}

		if (categorySlug && categorySlug !== "all") {
			const cat = await prisma.category.findUnique({
				where: { slug: categorySlug },
				select: { id: true },
			});
			if (cat) where.categoryId = cat.id;
		}

		if (subcategorySlug) {
			const sub = await prisma.subcategory.findUnique({
				where: { slug: subcategorySlug },
				select: { id: true },
			});
			if (sub) where.subcategoryId = sub.id;
		}

		const data = await prisma.equipment.findMany({
			where,
			include: {
				equipmentImageLinks: {
					include: { image: true },
					orderBy: { orderIndex: "asc" },
				},
			},
		});

		return groupEquipmentRows(data as unknown as RawEquipmentRow[]);
	}
);

export async function getEquipment(filters: {
	categorySlug?: string;
	subcategorySlug?: string | undefined;
	search?: string | undefined;
}): Promise<GroupedEquipment[]> {
	return fetchEquipmentCached(
		filters.categorySlug || "all",
		filters.subcategorySlug || "",
		filters.search || ""
	);
}

export async function getEquipmentBySlug(
	slug: string
): Promise<GroupedEquipment | null> {
	const data = await prisma.equipment.findMany({
		where: { slug },
		include: {
			equipmentImageLinks: {
				include: { image: true },
				orderBy: { orderIndex: "asc" },
			},
		},
	});

	if (!data.length) return null;

	const grouped = groupEquipmentRows(data as unknown as RawEquipmentRow[]);
	return grouped[0] ?? null;
}

export async function getRelatedEquipmentAction(ids: string[] | undefined) {
	if (!ids || ids.length === 0) return [];

	const data = await prisma.equipment.findMany({
		where: { id: { in: ids }, isAvailable: true },
		include: {
			equipmentImageLinks: { include: { image: true } },
		},
	});

	const grouped = groupEquipmentRows(data as unknown as RawEquipmentRow[]);
	const byId = Object.fromEntries(grouped.map((g) => [g.id, g]));
	return ids.map((id) => byId[id]).filter(Boolean);
}
