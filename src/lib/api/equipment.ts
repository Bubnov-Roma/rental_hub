"use server";

import { CATEGORIES } from "@/constants/categories";
import type {
	DbEquipment,
	GroupedEquipment,
	SupabaseLink,
} from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/utils";

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

	// фильтр по подкатегории — slug → id
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
		if (subcategoryId) {
			query = query.eq("subcategory", subcategoryId);
		}
	}

	const { data, error } = await query;

	if (error) throw error;

	const groupedMap = (data || []).reduce<Record<string, GroupedEquipment>>(
		(acc, item) => {
			const title = item.title;
			const imageUrls: string[] = [];

			if (
				item.equipment_image_links &&
				Array.isArray(item.equipment_image_links)
			) {
				item.equipment_image_links.forEach((link: SupabaseLink) => {
					if (link.images?.url) {
						imageUrls.push(link.images.url);
					}
				});
			}

			if (!acc[title]) {
				acc[title] = {
					...item,
					imageUrl: imageUrls[0] || "/placeholder-equipment.png",
					images: imageUrls,
					total_count: 0,
					available_count: 0,
					all_unit_ids: [],
					rating: 5.0, // Hardcoded for now
				};
			}
			if (acc[title]) {
				acc[title].total_count += 1;
				acc[title].all_unit_ids.push(item.id);
				if (item.status === "available" && item.is_available) {
					acc[title].available_count += 1;
				}
				if (imageUrls.length > 0 && !acc[title].imageUrl) {
					acc[title].imageUrl = imageUrls[0] ?? "";
					acc[title].images = imageUrls;
				}
			}
			return acc;
		},
		{}
	);
	return Object.values(groupedMap);
}

export async function getEquipmentBySlug(slug: string) {
	const supabase = await createClient();

	const { data } = await supabase
		.from("equipment")
		.select(`*, equipment_image_links(images(id, url))`);

	// Находим первый товар, чей slug совпадает
	const equipment: DbEquipment = data?.find(
		(item) => slugify(item.title) === slug
	);

	if (!equipment) return null;

	// Собираем данные так же, как в getEquipmentById
	const imageUrls =
		equipment.equipment_image_links
			?.map((l) => l.images?.url)
			.filter(Boolean) || [];

	return {
		...equipment,
		images: imageUrls,
		imageUrl: imageUrls[0] || "/placeholder-equipment.png",
	};
}

export async function getEquipmentById(id: string) {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("equipment")
		.select(`
      *,
      equipment_image_links(images(id, url))
    `)
		.eq("id", id)
		.single();

	if (error || !data) return null;

	const imageUrls: string[] = [];

	if (data.equipment_image_links && Array.isArray(data.equipment_image_links)) {
		data.equipment_image_links.forEach((link: SupabaseLink) => {
			if (link.images?.url) {
				imageUrls.push(link.images.url);
			}
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

	// 1. Получаем все товары
	const { data: items } = await supabase.from("equipment").select("id, title");

	if (!items) return;

	// 2. Обновляем каждый товар через транслитерацию
	for (const item of items) {
		await supabase
			.from("equipment")
			.update({ slug: slugify(item.title) })
			.eq("id", item.id);
	}

	console.log("Migration finished");
}

// "use server";

// import { CATEGORIES } from "@/constants/categories";
// import type {
// 	DbEquipment,
// 	GroupedEquipment,
// 	SupabaseLink,
// } from "@/core/domain/entities/Equipment";
// import { createClient } from "@/lib/supabase/server";
// import { slugify } from "@/utils";

// export async function getEquipment(filters: {
// 	categorySlug?: string;
// 	search?: string;
// }) {
// 	const supabase = await createClient();
// 	let query = supabase.from("equipment").select(`
//     *,
//     equipment_image_links(images(id, url))
//   `);

// 	if (filters.search) {
// 		query = query.ilike("title", `%${filters.search}%`);
// 	}

// 	if (filters.categorySlug && filters.categorySlug !== "all") {
// 		const cat = CATEGORIES.find((c) => c.slug === filters.categorySlug);
// 		if (cat) query = query.eq("category", cat.id);
// 	}

// 	const { data, error } = await query;

// 	if (error) throw error;

// 	const groupedMap = (data || []).reduce<Record<string, GroupedEquipment>>(
// 		(acc, item) => {
// 			const title = item.title;
// 			const imageUrls: string[] = [];

// 			if (
// 				item.equipment_image_links &&
// 				Array.isArray(item.equipment_image_links)
// 			) {
// 				item.equipment_image_links.forEach((link: SupabaseLink) => {
// 					if (link.images?.url) {
// 						imageUrls.push(link.images.url);
// 					}
// 				});
// 			}

// 			if (!acc[title]) {
// 				acc[title] = {
// 					...item,
// 					imageUrl: imageUrls[0] || "/placeholder-equipment.png",
// 					images: imageUrls,
// 					total_count: 0,
// 					available_count: 0,
// 					all_unit_ids: [],
// 					rating: 5.0, // Hardcoded for now
// 				};
// 			}
// 			if (acc[title]) {
// 				acc[title].total_count += 1;
// 				acc[title].all_unit_ids.push(item.id);
// 				if (item.status === "available" && item.is_available) {
// 					acc[title].available_count += 1;
// 				}
// 				if (imageUrls.length > 0 && !acc[title].imageUrl) {
// 					acc[title].imageUrl = imageUrls[0] ?? "";
// 					acc[title].images = imageUrls;
// 				}
// 			}
// 			return acc;
// 		},
// 		{}
// 	);
// 	return Object.values(groupedMap);
// }

// export async function getEquipmentBySlug(slug: string) {
// 	const supabase = await createClient();

// 	const { data } = await supabase
// 		.from("equipment")
// 		.select(`*, equipment_image_links(images(id, url))`);

// 	// Находим первый товар, чей slug совпадает
// 	const equipment: DbEquipment = data?.find(
// 		(item) => slugify(item.title) === slug
// 	);

// 	if (!equipment) return null;

// 	// Собираем данные так же, как в getEquipmentById
// 	const imageUrls =
// 		equipment.equipment_image_links
// 			?.map((l) => l.images?.url)
// 			.filter(Boolean) || [];

// 	return {
// 		...equipment,
// 		images: imageUrls,
// 		imageUrl: imageUrls[0] || "/placeholder-equipment.png",
// 	};
// }

// export async function getEquipmentById(id: string) {
// 	const supabase = await createClient();
// 	const { data, error } = await supabase
// 		.from("equipment")
// 		.select(`
//       *,
//       equipment_image_links(images(id, url))
//     `)
// 		.eq("id", id)
// 		.single();

// 	if (error || !data) return null;

// 	const imageUrls: string[] = [];

// 	if (data.equipment_image_links && Array.isArray(data.equipment_image_links)) {
// 		data.equipment_image_links.forEach((link: SupabaseLink) => {
// 			if (link.images?.url) {
// 				imageUrls.push(link.images.url);
// 			}
// 		});
// 	}

// 	return {
// 		...data,
// 		images: imageUrls,
// 		imageUrl: imageUrls[0] || "/placeholder-equipment.png",
// 	};
// }

// export async function migrateSlugs() {
// 	const supabase = await createClient();

// 	// 1. Получаем все товары
// 	const { data: items } = await supabase.from("equipment").select("id, title");

// 	if (!items) return;

// 	// 2. Обновляем каждый товар через транслитерацию
// 	for (const item of items) {
// 		await supabase
// 			.from("equipment")
// 			.update({ slug: slugify(item.title) })
// 			.eq("id", item.id);
// 	}

// 	console.log("Migration finished");
// }
