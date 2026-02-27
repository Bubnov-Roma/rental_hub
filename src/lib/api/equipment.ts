"use server";

import { CATEGORIES } from "@/constants/categories";
import type {
	GroupedEquipment,
	SupabaseLink,
} from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/utils";
import {
	groupEquipmentRows,
	type RawEquipmentRow,
} from "@/utils/group-equipment";

// ─── getEquipment (каталог) ───────────────────────────────────────────────────

export async function getEquipment(filters: {
	categorySlug?: string;
	subcategorySlug?: string;
	search?: string;
}) {
	const supabase = await createClient();
	let query = supabase.from("equipment").select(`
    *,
    equipment_image_links(images(id, url))
  `);

	if (filters.search) {
		query = query.ilike("title", `%${filters.search}%`);
	}

	if (filters.categorySlug && filters.categorySlug !== "all") {
		const cat = CATEGORIES.find((c) => c.slug === filters.categorySlug);
		if (cat) query = query.eq("category", cat.id);
	}

	if (filters.subcategorySlug) {
		let subcategoryId: string | null = null;
		outer: for (const cat of CATEGORIES) {
			if (!cat.subcategories) continue;
			for (const sub of cat.subcategories as Array<{
				id: string;
				slug: string;
			}>) {
				if (sub.slug === filters.subcategorySlug) {
					subcategoryId = sub.id;
					break outer;
				}
			}
		}
		if (subcategoryId) query = query.eq("subcategory", subcategoryId);
	}

	const { data, error } = await query;
	if (error) throw error;

	return groupEquipmentRows((data || []) as RawEquipmentRow[]);
}

// ─── getEquipmentBySlug (страница деталей) ────────────────────────────────────
// Запрашивает ВСЕ строки с нужным slug → группирует → корректный available_count.

export async function getEquipmentBySlug(
	slug: string
): Promise<GroupedEquipment | null> {
	const supabase = await createClient();

	// Запрос по колонке slug (требует наличия колонки slug в БД).
	// Если колонки нет — раскомментировать fallback ниже.
	const { data: allRows } = await supabase
		.from("equipment")
		.select(`*, equipment_image_links(images(id, url))`)
		.eq("slug", slug);

	// Fallback без колонки slug:
	// const { data: allData } = await supabase
	//   .from("equipment")
	//   .select(`*, equipment_image_links(images(id, url))`);
	// const allRows = (allData || []).filter(
	//   (item) => slugify(item.title) === slug
	// );

	const rows = (allRows || []) as RawEquipmentRow[];
	if (!rows.length) return null;

	const grouped = groupEquipmentRows(rows);
	return grouped[0] ?? null;
}

// ─── getEquipmentById (admin) ─────────────────────────────────────────────────

export async function getEquipmentById(id: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("equipment")
		.select(`*, equipment_image_links(images(id, url))`)
		.eq("id", id)
		.single();

	if (error || !data) return null;

	const imageUrls: string[] = [];
	if (data.equipment_image_links && Array.isArray(data.equipment_image_links)) {
		data.equipment_image_links.forEach((link: SupabaseLink) => {
			if (link.images?.url) imageUrls.push(link.images.url);
		});
	}

	return {
		...data,
		images: imageUrls,
		imageUrl: imageUrls[0] || "/placeholder-equipment.png",
	};
}

export async function migrateSlugs() {
	const supabase = await createClient();
	const { data: items } = await supabase.from("equipment").select("id, title");
	if (!items) return;
	for (const item of items) {
		await supabase
			.from("equipment")
			.update({ slug: slugify(item.title) })
			.eq("id", item.id);
	}
}
