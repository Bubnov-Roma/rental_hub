"use server";

import { revalidatePath } from "next/cache";
import { CATEGORIES } from "@/constants";
import type { DbEquipment } from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/utils";

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

// Partial update type - only fields that can be updated
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

	// Global search
	if (params.search) {
		query = query.or(
			`title.ilike.%${params.search}%,description.ilike.%${params.search}%,inventory_number.ilike.%${params.search}%`
		);
	}

	// Advanced filters
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

	// Sorting
	if (params.sort && params.sort.length > 0) {
		for (const s of params.sort) {
			query = query.order(s.column, { ascending: s.ascending });
		}
	} else {
		query = query.order("created_at", { ascending: false });
	}

	// Pagination
	if (params.limit) {
		query = query.limit(params.limit);
	}
	if (params.offset) {
		query = query.range(
			params.offset,
			params.offset + (params.limit || 50) - 1
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

	// auto generation slug, if title change
	const finalUpdates = { ...updates };
	if (updates.title) {
		finalUpdates.slug = slugify(updates.title);
	}

	// Clean the updates object - remove undefined values
	const cleanUpdates = Object.fromEntries(
		Object.entries(updates).filter(([_, v]) => v !== undefined)
	);

	const { data, error } = await supabase
		.from("equipment")
		// .update({ ...finalUpdates, updated_at: new Date().toISOString() })
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

	// Delete image links first
	await supabase.from("equipment_image_links").delete().in("equipment_id", ids);

	// Delete equipment
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

	// Get original equipment
	const { data: original, error: fetchError } = await supabase
		.from("equipment")
		.select(
			`
      *,
      equipment_image_links(image_id)
    `
		)
		.eq("id", id)
		.single();

	if (fetchError || !original) {
		console.error("Fetch error:", fetchError);
		throw new Error(`Failed to fetch equipment: ${fetchError?.message}`);
	}

	// Generate new inventory number
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

	// Create duplicate
	const {
		id: _,
		created_at: __,
		updated_at: ___,
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
		console.error("Insert error:", insertError);
		throw new Error(`Failed to duplicate equipment: ${insertError.message}`);
	}

	// Copy image links
	if (equipment_image_links && equipment_image_links.length > 0) {
		const imageLinks = equipment_image_links.map(
			(link: { image_id: string }) => ({
				equipment_id: newEquipment.id,
				image_id: link.image_id,
			})
		);
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

	// Clean the updates object
	const cleanUpdates = Object.fromEntries(
		Object.entries(updates).filter(([_, v]) => v !== undefined)
	);

	const { data, error } = await supabase
		.from("equipment")
		.update({ ...cleanUpdates, updated_at: new Date().toISOString() })
		.in("id", ids)
		.select();

	if (error) {
		console.error("Bulk update error:", error);
		throw new Error(`Failed to bulk update equipment: ${error.message}`);
	}

	revalidatePath("/admin/equipment");
	return data as DbEquipment[];
}

export async function syncEquipmentByTitle(targetId: string, fields: string[]) {
	const supabase = await createClient();

	// Get source equipment
	const { data: source } = await supabase
		.from("equipment")
		.select("*")
		.eq("id", targetId)
		.single();

	if (!source) throw new Error("Equipment not found");

	// Find all equipment with same title
	const { data: siblings } = await supabase
		.from("equipment")
		.select("id")
		.eq("title", source.title)
		.neq("id", targetId);

	if (!siblings || siblings.length === 0) return { updated: 0 };

	// Prepare updates
	const updates: EquipmentUpdateData = {};
	for (const field of fields) {
		if (
			source[field] !== undefined &&
			field !== "id" &&
			field !== "created_at" &&
			field !== "updated_at" &&
			field !== "inventory_number"
		) {
			(updates as Record<string, unknown>)[field] = source[field];
		}
	}

	// Update siblings
	const siblingIds = siblings.map((s) => s.id);
	await bulkUpdateEquipment(siblingIds, updates);

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

	const comments =
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
			comments: [...comments, newComment],
			updated_at: new Date().toISOString(),
		})
		.eq("id", equipmentId)
		.select()
		.single();

	if (error) {
		console.error("Add comment error:", error);
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
		console.error("Export error:", error);
		throw new Error(`Failed to export equipment: ${error.message}`);
	}

	return data as DbEquipment[];
}

export async function searchEquipmentAction(
	query: string
): Promise<DbEquipment[]> {
	if (!query || query.length < 2) return [];

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("equipment")
		.select(`
      *,
      equipment_image_links(images(id, url))
    `)
		.ilike("title", `%${query}%`)
		.limit(10);

	if (error) return [];

	const grouped = data.reduce((acc, item: DbEquipment) => {
		const title = item.title;
		if (!acc[title]) {
			const images =
				item.equipment_image_links?.map((l) => l.images?.url).filter(Boolean) ||
				[];
			acc[title] = {
				...item,
				slug: slugify(title),
				imageUrl: images[0] || "/placeholder-equipment.png",
			};
		}
		return acc;
	}, {});

	return Object.values(grouped);
}

export async function migrateCategoriesToIds() {
	const supabase = await createClient();

	const { data: items, error } = await supabase
		.from("equipment")
		.select("id, category");

	if (error || !items) {
		console.error("Migration error:", error);
		return { success: false, error };
	}

	let updatedCount = 0;

	for (const item of items) {
		const categoryConfig = CATEGORIES.find(
			(c) => c.name.toLowerCase() === item.category?.toLowerCase()
		);

		// Если нашли совпадение по имени и это не "all", обновляем на ID
		if (categoryConfig && categoryConfig.id !== "all") {
			const { error: updateError } = await supabase
				.from("equipment")
				.update({ category: categoryConfig.id })
				.eq("id", item.id);

			if (!updateError) updatedCount++;
		}
	}
	revalidatePath("/admin/equipment");
	return { success: true, updatedCount };
}
