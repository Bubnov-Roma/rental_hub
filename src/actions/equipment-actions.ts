"use server";

import { revalidatePath } from "next/cache";
import { cache } from "react";
import type {
	DbEquipment,
	GroupedEquipment,
} from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/utils";
import {
	groupEquipmentRows,
	type RawEquipmentRow,
} from "@/utils/group-equipment";

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

export type EquipmentFilter = {
	column: string;
	operator: FilterOperator;
	value: string | number | boolean | null;
};

export type EquipmentSort = {
	column: string;
	ascending: boolean;
};

export type EquipmentUpdateData = Partial<DbEquipment>;

export async function getEquipmentWithFilters(params: {
	search?: string;
	filters?: EquipmentFilter[];
	sort?: EquipmentSort[];
	limit?: number;
	offset?: number;
}) {
	const supabase = await createClient();
	let query = supabase.from("equipment").select(
		`
    *,
    equipment_image_links(images(id, url))
  `,
		{ count: "exact" }
	);

	if (params.search) {
		query = query.or(
			`title.ilike.%${params.search}%,description.ilike.%${params.search}%,inventory_number.ilike.%${params.search}%`
		);
	}

	if (params.filters && params.filters.length > 0) {
		for (const filter of params.filters) {
			const { column, operator, value } = filter;
			switch (operator) {
				case "eq":
					query = query.eq(column, value);
					break;
				case "neq":
					query = query.neq(column, value);
					break;
				case "gt":
					query = query.gt(column, value);
					break;
				case "gte":
					query = query.gte(column, value);
					break;
				case "lt":
					query = query.lt(column, value);
					break;
				case "lte":
					query = query.lte(column, value);
					break;
				case "like":
					query = query.like(column, `%${value}%`);
					break;
				case "ilike":
					query = query.ilike(column, `%${value}%`);
					break;
				case "in":
					query = query.in(column, Array.isArray(value) ? value : [value]);
					break;
				case "is":
					query = query.is(column, value);
					break;
				case "contains":
					if (value !== null) {
						const filterValue = Array.isArray(value) ? value : [value];
						query = query.contains(column, filterValue);
					}
					break;
			}
		}
	}

	if (params.sort && params.sort.length > 0) {
		for (const s of params.sort) {
			query = query.order(s.column, { ascending: s.ascending });
		}
	} else {
		query = query.order("created_at", { ascending: false });
	}

	if (params.limit) {
		query = query.limit(params.limit);
	}
	if (params.offset) {
		query = query.range(
			params.offset,
			params.offset + (params.limit ?? 50) - 1
		);
	}

	const { data, error, count } = await query;

	if (error) {
		console.error("Database error:", error);
		throw new Error(`Failed to fetch equipment: ${error.message}`);
	}

	return { data: data as DbEquipment[], count };
}

export async function updateEquipment(
	id: string,
	updates: EquipmentUpdateData
) {
	const supabase = await createClient();

	// Auto-generate slug when title changes
	const withSlug: EquipmentUpdateData = updates.title
		? { ...updates, slug: slugify(updates.title) }
		: { ...updates };

	// Remove undefined — keep null (null = clear field in DB)
	const cleanUpdates = Object.fromEntries(
		Object.entries(withSlug).filter(([, v]) => v !== undefined)
	);

	const { data, error } = await supabase
		.from("equipment")
		.update({ ...cleanUpdates, updated_at: new Date().toISOString() })
		.eq("id", id)
		.select()
		.single();

	if (error) {
		console.error("Update error:", error);
		throw new Error(`Failed to update equipment: ${error.message}`);
	}

	revalidatePath("/admin/equipment");
	return data as DbEquipment;
}

export async function deleteEquipment(ids: string[]) {
	const supabase = await createClient();

	// Check for booking_items references to prevent FK violation
	const { data: referencedItems } = await supabase
		.from("booking_items")
		.select("equipment_id, bookings!inner(status)")
		.in("equipment_id", ids)
		.not("bookings.status", "eq", "cancelled");

	if (referencedItems && referencedItems.length > 0) {
		// Soft-delete: mark as unavailable instead of hard delete
		const refIds = [
			...new Set(referencedItems.map((r) => r.equipment_id as string)),
		];
		const freeIds = ids.filter((id) => !refIds.includes(id));

		// Hard-delete equipment that has no active bookings
		if (freeIds.length > 0) {
			await supabase
				.from("equipment_image_links")
				.delete()
				.in("equipment_id", freeIds);
			await supabase.from("equipment").delete().in("id", freeIds);
		}

		// Soft-delete equipment that is still referenced
		await supabase
			.from("equipment")
			.update({
				is_available: false,
				status: "archived",
				updated_at: new Date().toISOString(),
			})
			.in("id", refIds);

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

	// No active bookings — safe to hard-delete
	await supabase.from("equipment_image_links").delete().in("equipment_id", ids);

	const { error } = await supabase.from("equipment").delete().in("id", ids);

	if (error) {
		console.error("Delete error:", error);
		throw new Error(`Failed to delete equipment: ${error.message}`);
	}

	revalidatePath("/admin/equipment");
	return { success: true };
}

export async function duplicateEquipment(id: string) {
	const supabase = await createClient();

	const { data: original, error: fetchError } = await supabase
		.from("equipment")
		.select(`*, equipment_image_links(image_id)`)
		.eq("id", id)
		.single();

	if (fetchError || !original) {
		throw new Error(`Failed to fetch equipment: ${fetchError?.message}`);
	}

	const baseNumber = original.inventory_number || "COPY";
	const { data: existing } = await supabase
		.from("equipment")
		.select("inventory_number")
		.ilike("inventory_number", `${baseNumber}%`)
		.order("inventory_number", { ascending: false });

	let newInventoryNumber = `${baseNumber}-1`;
	if (existing && existing.length > 0) {
		const numbers = existing
			.map((e) => {
				const match = e.inventory_number?.match(/-(\d+)$/);
				return match ? Number.parseInt(match[1], 10) : 0;
			})
			.filter((n) => !Number.isNaN(n));
		const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
		newInventoryNumber = `${baseNumber}-${maxNum + 1}`;
	}

	const {
		id: _id,
		created_at: _created,
		updated_at: _updated,
		equipment_image_links,
		...equipmentData
	} = original;

	const { data: newEquipment, error: insertError } = await supabase
		.from("equipment")
		.insert({
			...equipmentData,
			inventory_number: newInventoryNumber,
			slug: slugify(equipmentData.title),
		})
		.select()
		.single();

	if (insertError) {
		throw new Error(`Failed to duplicate equipment: ${insertError.message}`);
	}

	if (equipment_image_links && equipment_image_links.length > 0) {
		const imageLinks = (
			equipment_image_links as Array<{ image_id: string }>
		).map((link) => ({
			equipment_id: newEquipment.id,
			image_id: link.image_id,
		}));
		await supabase.from("equipment_image_links").insert(imageLinks);
	}

	revalidatePath("/admin/equipment");
	return newEquipment as DbEquipment;
}

export async function bulkUpdateEquipment(
	ids: string[],
	updates: EquipmentUpdateData
) {
	const supabase = await createClient();

	const cleanUpdates = Object.fromEntries(
		Object.entries(updates).filter(([, v]) => v !== undefined)
	);

	const { data, error } = await supabase
		.from("equipment")
		.update({ ...cleanUpdates, updated_at: new Date().toISOString() })
		.in("id", ids)
		.select();

	if (error) {
		throw new Error(`Failed to bulk update equipment: ${error.message}`);
	}

	revalidatePath("/admin/equipment");
	return data as DbEquipment[];
}

export async function syncEquipmentByTitle(targetId: string, fields: string[]) {
	const supabase = await createClient();

	const { data: source } = await supabase
		.from("equipment")
		.select("*")
		.eq("id", targetId)
		.single();

	if (!source) throw new Error("Equipment not found");

	const { data: siblings } = await supabase
		.from("equipment")
		.select("id")
		.eq("title", source.title)
		.neq("id", targetId);

	if (!siblings || siblings.length === 0) return { updated: 0 };

	const updates: Record<string, unknown> = {};
	for (const field of fields) {
		if (
			source[field] !== undefined &&
			field !== "id" &&
			field !== "created_at" &&
			field !== "updated_at" &&
			field !== "inventory_number"
		) {
			updates[field] = source[field];
		}
	}

	const siblingIds = siblings.map((s) => s.id);
	await bulkUpdateEquipment(siblingIds, updates as EquipmentUpdateData);

	return { updated: siblingIds.length };
}

export async function addComment(
	equipmentId: string,
	comment: { text: string; author: string }
) {
	const supabase = await createClient();

	const { data: equipment } = await supabase
		.from("equipment")
		.select("comments")
		.eq("id", equipmentId)
		.single();

	const existing =
		(equipment?.comments as Array<{
			id: string;
			text: string;
			author: string;
			created_at: string;
		}>) || [];

	const newComment = {
		id: crypto.randomUUID(),
		text: comment.text,
		author: comment.author,
		created_at: new Date().toISOString(),
	};

	const { data, error } = await supabase
		.from("equipment")
		.update({
			comments: [...existing, newComment],
			updated_at: new Date().toISOString(),
		})
		.eq("id", equipmentId)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to add comment: ${error.message}`);
	}

	revalidatePath("/admin/equipment");
	return data as DbEquipment;
}

export async function exportEquipment(ids?: string[]) {
	const supabase = await createClient();

	let query = supabase.from("equipment").select("*");
	if (ids && ids.length > 0) {
		query = query.in("id", ids);
	}

	const { data, error } = await query;
	if (error) {
		throw new Error(`Failed to export equipment: ${error.message}`);
	}

	return data as DbEquipment[];
}

export async function setPrimaryEquipmentAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	// Get the title of this equipment
	const { data: item } = await supabase
		.from("equipment")
		.select("title")
		.eq("id", id)
		.single();

	if (!item) return { success: false, error: "Позиция не найдена" };

	// Clear is_primary on all siblings
	await supabase
		.from("equipment")
		.update({ is_primary: false })
		.eq("title", item.title);

	// Set is_primary on this one
	const { error } = await supabase
		.from("equipment")
		.update({ is_primary: true })
		.eq("id", id);

	if (error) return { success: false, error: error.message };

	revalidatePath("/admin/equipment");
	return { success: true };
}

export async function searchEquipmentAction(
	query: string
): Promise<DbEquipment[]> {
	if (!query || query.length < 2) return [];

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("equipment")
		.select(`*, equipment_image_links(images(id, url))`)
		.eq("is_available", true)
		.ilike("title", `%${query}%`)
		.limit(10);

	if (error) return [];

	// Группируем по title — показываем только одну карточку на модель
	const grouped = data.reduce<Record<string, DbEquipment>>((acc, item) => {
		const title = item.title as string;
		if (!acc[title]) {
			const images =
				(
					item.equipment_image_links as Array<{
						images: { url: string } | null;
					}>
				)
					?.map((l) => l.images?.url)
					.filter((url): url is string => Boolean(url)) ?? [];

			acc[title] = {
				...(item as DbEquipment),
				slug: slugify(title),
				// equipment_image_links не нужен в результате поиска
				equipment_image_links: [],
				images_data: images.map((url) => ({ id: url, url })),
			};
		}
		return acc;
	}, {});

	return Object.values(grouped);
}

// ─── getEquipment (каталог) ───────────────────────────────────────────────────

const fetchEquipmentCached = cache(
	async (categorySlug: string, subcategorySlug: string, search: string) => {
		const supabase = await createClient();
		let query = supabase.from("equipment").select(`
    *,
    equipment_image_links(images(id, url))
  `);

		query = query.eq("is_available", true);

		if (search) {
			query = query.ilike("title", `%${search}%`);
		}

		// Делаем запросы за ID категорий (они тоже быстро отработают)
		if (categorySlug && categorySlug !== "all") {
			const { data: catRow } = await supabase
				.from("categories")
				.select("id")
				.eq("slug", categorySlug)
				.single();

			if (catRow) {
				query = query.eq("category", catRow.id);
			}
		}

		if (subcategorySlug) {
			const { data: subRow } = await supabase
				.from("subcategories")
				.select("id")
				.eq("slug", subcategorySlug)
				.single();

			if (subRow) {
				query = query.eq("subcategory", subRow.id);
			}
		}

		const { data, error } = await query;
		if (error) throw error;

		return groupEquipmentRows((data || []) as RawEquipmentRow[]);
	}
);

export async function getEquipment(filters: {
	categorySlug?: string;
	subcategorySlug?: string;
	search?: string;
}) {
	// Распаковываем объект в примитивы для идеальной работы кэша
	return fetchEquipmentCached(
		filters.categorySlug || "all",
		filters.subcategorySlug || "",
		filters.search || ""
	);
}

export async function getEquipmentBySlug(
	slug: string
): Promise<GroupedEquipment | null> {
	const supabase = await createClient();

	const { data: allRows } = await supabase
		.from("equipment")
		.select(`*, equipment_image_links(images(id, url))`)
		.eq("slug", slug);

	const rows = (allRows || []) as RawEquipmentRow[];
	if (!rows.length) return null;

	const grouped = groupEquipmentRows(rows);
	return grouped[0] ?? null;
}
// ─── getRelatedEquipmentAction ────────────────────────────────────────────────
// Fetches full grouped equipment for a list of IDs (used in EquipmentDetails related slider)

export async function getRelatedEquipmentAction(
	ids: string[]
): Promise<GroupedEquipment[]> {
	if (!ids || ids.length === 0) return [];

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("equipment")
		.select(`*, equipment_image_links(images(id, url))`)
		.in("id", ids)
		.eq("is_available", true);

	if (error || !data) return [];

	// Use groupEquipmentRows to normalise into GroupedEquipment[]
	const rows = data as RawEquipmentRow[];
	const grouped = groupEquipmentRows(rows);

	// Preserve the original order from ids
	const byId = Object.fromEntries(grouped.map((g) => [g.id, g]));
	return ids.map((id) => byId[id]).filter(Boolean) as GroupedEquipment[];
}
