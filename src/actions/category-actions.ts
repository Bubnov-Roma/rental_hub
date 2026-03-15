"use server";

import { revalidatePath } from "next/cache";
import { cache } from "react";
import type { DbCategory, DbSubcategory } from "@/constants/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/utils";

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getCategoriesFromDb = cache(async (): Promise<DbCategory[]> => {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("categories")
		.select(
			"id, name, slug, icon_name, image_url, is_modular, admin_notes, subcategories(id, name, slug, sort_order, image_url, admin_notes)"
		)
		.order("sort_order");

	if (error || !data) return [];

	return data.map((cat) => ({
		id: cat.id,
		name: cat.name,
		slug: cat.slug,
		icon_name: cat.icon_name,
		image_url: cat.image_url ?? null,
		is_modular: cat.is_modular ?? false,
		admin_notes: cat.admin_notes ?? null,
		subcategories: (
			(cat.subcategories as Array<DbSubcategory & { sort_order: number }>) ?? []
		).sort((a, b) => a.sort_order - b.sort_order),
	}));
});

// ─── History helper ───────────────────────────────────────────────────────────

async function logHistory(
	entityType: "category" | "subcategory",
	entityId: string,
	action: "created" | "updated" | "deleted",
	changes?: Record<string, [unknown, unknown]>
) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		await supabase.from("category_history").insert({
			entity_type: entityType,
			entity_id: entityId,
			action,
			changed_by: user?.id ?? null,
			changes: changes ?? null,
		});
	} catch {
		// History logging is non-critical
	}
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export async function createCategoryAction(data: {
	name: string;
	icon_name?: string;
	image_url?: string;
	is_modular?: boolean;
	admin_notes?: string;
}): Promise<{ success: boolean; category?: DbCategory; error?: string }> {
	const supabase = await createClient();

	const { data: last } = await supabase
		.from("categories")
		.select("sort_order")
		.order("sort_order", { ascending: false })
		.limit(1)
		.single();

	const nextOrder = (last?.sort_order ?? 0) + 1;
	const slug = slugify(data.name);

	const { data: created, error } = await supabase
		.from("categories")
		.insert({
			name: data.name.trim(),
			slug,
			icon_name: data.icon_name ?? "Package",
			image_url: data.image_url ?? null,
			is_modular: data.is_modular ?? false,
			admin_notes: data.admin_notes ?? null,
			sort_order: nextOrder,
		})
		.select("id, name, slug, icon_name, image_url, is_modular, admin_notes")
		.single();

	if (error) {
		if (error.code === "23505")
			return {
				success: false,
				error: "Категория с таким названием уже существует",
			};
		return { success: false, error: error.message };
	}

	await logHistory("category", created.id, "created");
	revalidatePath("/", "layout");
	return {
		success: true,
		category: { ...created, subcategories: [] },
	};
}

export async function updateCategoryAction(
	id: string,
	data: {
		name?: string;
		icon_name?: string;
		image_url?: string;
		is_modular?: boolean;
		admin_notes?: string | undefined;
		sort_order?: number;
	}
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	const { data: current } = await supabase
		.from("categories")
		.select("*")
		.eq("id", id)
		.single();

	const updates: Record<string, unknown> = {};
	if (data.name !== undefined) {
		updates.name = data.name.trim();
		updates.slug = slugify(data.name);
	}
	if (data.icon_name !== undefined) updates.icon_name = data.icon_name;
	if (data.image_url !== undefined) updates.image_url = data.image_url;
	if (data.is_modular !== undefined) updates.is_modular = data.is_modular;
	if (data.admin_notes !== undefined) updates.admin_notes = data.admin_notes;
	if (data.sort_order !== undefined) updates.sort_order = data.sort_order;

	const { error } = await supabase
		.from("categories")
		.update(updates)
		.eq("id", id);
	if (error) return { success: false, error: error.message };

	const changes: Record<string, [unknown, unknown]> = {};
	for (const [key, newVal] of Object.entries(updates)) {
		if (current && current[key] !== newVal)
			changes[key] = [current[key], newVal];
	}
	await logHistory("category", id, "updated", changes);
	revalidatePath("/", "layout");
	return { success: true };
}

export async function deleteCategoryAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	const { count } = await supabase
		.from("equipment")
		.select("id", { count: "exact", head: true })
		.eq("category", id);

	if (count && count > 0)
		return {
			success: false,
			error: `Нельзя удалить: в категории ${count} позиций техники`,
		};

	const { data: cat } = await supabase
		.from("categories")
		.select("name")
		.eq("id", id)
		.single();

	const { error } = await supabase.from("categories").delete().eq("id", id);
	if (error) return { success: false, error: error.message };

	await logHistory("category", id, "deleted", { name: [cat?.name, null] });
	revalidatePath("/", "layout");
	return { success: true };
}

export async function reorderCategoriesAction(
	orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const updates = orderedIds.map((id, index) =>
		supabase
			.from("categories")
			.update({ sort_order: index + 1 })
			.eq("id", id)
	);
	const results = await Promise.all(updates);
	const firstError = results.find((r) => r.error)?.error;
	if (firstError) return { success: false, error: firstError.message };
	revalidatePath("/", "layout");
	return { success: true };
}

export async function reorderSubcategoriesAction(
	orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const updates = orderedIds.map((id, index) =>
		supabase
			.from("subcategories")
			.update({ sort_order: index + 1 })
			.eq("id", id)
	);
	const results = await Promise.all(updates);
	const firstError = results.find((r) => r.error)?.error;
	if (firstError) return { success: false, error: firstError.message };
	revalidatePath("/", "layout");
	return { success: true };
}

export async function getCategoryHistoryAction(entityId: string) {
	const supabase = await createClient();
	const { data } = await supabase
		.from("category_history")
		.select("*, profiles(name, email)")
		.eq("entity_id", entityId)
		.order("changed_at", { ascending: false })
		.limit(50);
	return data ?? [];
}

// ─── Subcategory CRUD ─────────────────────────────────────────────────────────

export async function createSubcategoryAction(data: {
	category_id: string;
	name: string;
	image_url?: string;
	admin_notes?: string;
}): Promise<{ success: boolean; subcategory?: DbSubcategory; error?: string }> {
	const supabase = await createClient();

	const { data: last } = await supabase
		.from("subcategories")
		.select("sort_order")
		.eq("category_id", data.category_id)
		.order("sort_order", { ascending: false })
		.limit(1)
		.single();

	const nextOrder = (last?.sort_order ?? 0) + 1;

	const { data: created, error } = await supabase
		.from("subcategories")
		.insert({
			category_id: data.category_id,
			name: data.name.trim(),
			slug: slugify(data.name),
			sort_order: nextOrder,
			image_url: data.image_url ?? null,
			admin_notes: data.admin_notes ?? null,
		})
		.select("id, name, slug, image_url, admin_notes")
		.single();

	if (error) return { success: false, error: error.message };

	await logHistory("subcategory", created.id, "created");
	revalidatePath("/", "layout");
	return { success: true, subcategory: created };
}

export async function updateSubcategoryAction(
	id: string,
	data: {
		name?: string;
		image_url?: string;
		admin_notes?: string | undefined;
		sort_order?: number;
	}
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	const { data: current } = await supabase
		.from("subcategories")
		.select("*")
		.eq("id", id)
		.single();

	const updates: Record<string, unknown> = {};
	if (data.name !== undefined) {
		updates.name = data.name.trim();
		updates.slug = slugify(data.name);
	}
	if (data.image_url !== undefined) updates.image_url = data.image_url;
	if (data.admin_notes !== undefined) updates.admin_notes = data.admin_notes;
	if (data.sort_order !== undefined) updates.sort_order = data.sort_order;

	const { error } = await supabase
		.from("subcategories")
		.update(updates)
		.eq("id", id);
	if (error) return { success: false, error: error.message };

	const changes: Record<string, [unknown, unknown]> = {};
	for (const [key, newVal] of Object.entries(updates)) {
		if (current && current[key] !== newVal)
			changes[key] = [current[key], newVal];
	}
	await logHistory("subcategory", id, "updated", changes);
	revalidatePath("/", "layout");
	return { success: true };
}

export async function deleteSubcategoryAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	await supabase
		.from("equipment")
		.update({ subcategory: null })
		.eq("subcategory", id);
	const { error } = await supabase.from("subcategories").delete().eq("id", id);
	if (error) return { success: false, error: error.message };
	await logHistory("subcategory", id, "deleted");
	revalidatePath("/", "layout");
	return { success: true };
}

// ─── Create equipment ─────────────────────────────────────────────────────────

export type CreateEquipmentData = {
	title: string;
	category: string;
	subcategory?: string | null;
	inventory_number?: string | undefined;
	price_per_day: number;
	price_4h?: number | undefined;
	price_8h?: number | undefined;
	deposit?: number | undefined;
	replacement_value?: number | undefined;
	description?: string | undefined;
	kit_description?: string | undefined;
	defects?: string | undefined;
	status?: string | undefined;
	is_available?: boolean | undefined;
	ownership_type?: string | undefined;
	partner_name?: string | undefined;
	specifications?: Record<string, unknown>;
	related_ids?: string[];
};

export async function createEquipmentAction(
	data: CreateEquipmentData
): Promise<{ success: boolean; id?: string; error?: string }> {
	const supabase = await createClient();

	const { data: created, error } = await supabase
		.from("equipment")
		.insert({
			...data,
			slug: slugify(data.title),
			is_available: data.is_available ?? true,
			status: data.status ?? "available",
			ownership_type: data.ownership_type ?? "internal",
			specifications: data.specifications ?? {},
			comments: [],
			related_ids: data.related_ids ?? [],
		})
		.select("id")
		.single();

	if (error) return { success: false, error: error.message };
	revalidatePath("/admin/equipment");
	return { success: true, id: created.id };
}

// ─── FAQ CRUD ─────────────────────────────────────────────────────────────────

export type FaqItem = {
	id: string;
	question: string;
	answer: string;
	sort_order: number;
	category: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

export async function getFaqItemsAction(): Promise<FaqItem[]> {
	const supabase = await createClient();
	const { data } = await supabase
		.from("faq_items")
		.select("*")
		.order("sort_order");
	return (data as FaqItem[]) ?? [];
}

export async function createFaqItemAction(data: {
	question: string;
	answer: string;
	category?: string;
}): Promise<{ success: boolean; item?: FaqItem; error?: string }> {
	const supabase = await createClient();

	const { data: last } = await supabase
		.from("faq_items")
		.select("sort_order")
		.order("sort_order", { ascending: false })
		.limit(1)
		.single();

	const { data: created, error } = await supabase
		.from("faq_items")
		.insert({
			question: data.question.trim(),
			answer: data.answer.trim(),
			category: data.category ?? null,
			sort_order: (last?.sort_order ?? 0) + 1,
		})
		.select("*")
		.single();

	if (error) return { success: false, error: error.message };
	revalidatePath("/faq");
	revalidatePath("/admin");
	return { success: true, item: created as FaqItem };
}

export async function updateFaqItemAction(
	id: string,
	data: Partial<
		Pick<
			FaqItem,
			"question" | "answer" | "category" | "is_active" | "sort_order"
		>
	>
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const { error } = await supabase
		.from("faq_items")
		.update({ ...data, updated_at: new Date().toISOString() })
		.eq("id", id);
	if (error) return { success: false, error: error.message };
	revalidatePath("/faq");
	revalidatePath("/admin");
	return { success: true };
}

export async function deleteFaqItemAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const { error } = await supabase.from("faq_items").delete().eq("id", id);
	if (error) return { success: false, error: error.message };
	revalidatePath("/faq");
	revalidatePath("/admin");
	return { success: true };
}

export async function reorderFaqItemsAction(
	orderedIds: string[]
): Promise<{ success: boolean }> {
	const supabase = await createClient();
	await Promise.all(
		orderedIds.map((id, index) =>
			supabase
				.from("faq_items")
				.update({ sort_order: index + 1 })
				.eq("id", id)
		)
	);
	revalidatePath("/faq");
	return { success: true };
}
