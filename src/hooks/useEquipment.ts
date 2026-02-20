import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CATEGORIES } from "@/constants/categories";
import type {
	DbEquipment,
	GroupedEquipment,
	OwnershipType,
	SupabaseImage,
} from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/client";

type useEquipmentType = {
	search?: string;
	categorySlug?: string;
	subcategorySlug?: string;
	minPrice?: number;
	maxPrice?: number;
	limit?: number;
	group?: boolean;
};

export function useEquipment(
	filters: useEquipmentType,
	initialData?: GroupedEquipment[]
) {
	const supabase = createClient();

	const memoFilters = useMemo(
		() => ({
			search: filters.search?.trim() || undefined,
			categorySlug: filters.categorySlug || "all",
			subcategorySlug: filters.subcategorySlug || "",
			limit: filters.limit,
			group: filters.group ?? true,
		}),
		[
			filters.search,
			filters.categorySlug,
			filters.subcategorySlug,
			filters.limit,
			filters.group,
		]
	);

	return useQuery({
		queryKey: ["equipment", memoFilters],
		queryFn: async () => {
			let query = supabase.from("equipment").select(`
        *,
        equipment_image_links(images(id, url))
      `);

			// поиск по названию
			if (memoFilters.search) {
				query = query.ilike("title", `%${memoFilters.search}%`);
			}

			// фильтр по категории
			if (memoFilters.categorySlug && memoFilters.categorySlug !== "all") {
				const cat = CATEGORIES.find((c) => c.slug === memoFilters.categorySlug);
				if (cat) query = query.eq("category", cat.id);
			}

			// фильтр по подкатегории — slug → id
			if (memoFilters.subcategorySlug) {
				let subcategoryId: string | null = null;
				outer: for (const cat of CATEGORIES) {
					if (!cat.subcategories) continue;
					for (const sub of cat.subcategories as Array<{
						id: string;
						slug: string;
					}>) {
						if (sub.slug === memoFilters.subcategorySlug) {
							subcategoryId = sub.id;
							break outer;
						}
					}
				}
				if (subcategoryId) {
					query = query.eq("subcategory", subcategoryId);
				}
			}

			if (memoFilters.limit) query = query.limit(memoFilters.limit);

			const { data, error } = await query;
			if (error) throw error;

			const dbItems = (data as unknown as DbEquipment[]) || [];

			// хелпер для извлечения изображений
			const extractImages = (item: DbEquipment): SupabaseImage[] => {
				if (
					!item.equipment_image_links ||
					!Array.isArray(item.equipment_image_links)
				) {
					return [];
				}
				return item.equipment_image_links
					.map((link) => link.images)
					.filter((img): img is SupabaseImage => Boolean(img?.url));
			};

			// негруппированный вид (ADMIN TABLE)
			if (!memoFilters.group) {
				return dbItems.map((item) => {
					const imagesData = extractImages(item);
					return {
						...item,
						imageUrl: imagesData[0]?.url || "/placeholder-equipment.png",
						images: imagesData.map((img) => img.url),
						images_data: imagesData,
						total_count: 1,
						available_count: item.is_available ? 1 : 0,
						all_unit_ids: [item.id],
						comments: item.comments || [],
					} as unknown as GroupedEquipment;
				});
			}

			// СГРУППИРОВАННЫЙ ВИД (клиентский каталог)
			const groupedMap = dbItems.reduce<Record<string, GroupedEquipment>>(
				(acc, item) => {
					const title = item.title;
					const imagesData = extractImages(item);
					const imageUrls = imagesData.map((img) => img.url);

					if (!acc[title]) {
						acc[title] = {
							...item,
							description: item.description || "Нет описания",
							ownership_type: item.ownership_type as OwnershipType,
							status: "available",
							kit: item.kit_description,
							related_ids: item.related_ids || [],
							imageUrl: imageUrls[0] || "/placeholder-equipment.png",
							images: imageUrls,
							rating: 5.0,
							reviewsCount: 0,
							specifications:
								(item.specifications as Record<string, string>) || {},
							images_data: imagesData,
							total_count: 0,
							available_count: 0,
							all_unit_ids: [],
							comments: item.comments || [],
						};
					}

					const group = acc[title];
					group.total_count += 1;
					group.all_unit_ids.push(item.id);

					if (item.status === "available" && item.is_available) {
						group.available_count += 1;
					}

					if (
						imageUrls.length > 0 &&
						(!group.imageUrl || group.imageUrl.includes("placeholder"))
					) {
						group.imageUrl = imageUrls[0] || "/placeholder-equipment.png";
						group.images = imageUrls;
						group.images_data = imagesData;
					}

					return acc;
				},
				{}
			);

			return Object.values(groupedMap);
		},
		initialData,
		enabled: true,
		staleTime: 1000 * 60 * 5,
		retry: 1,
	});
}

// import { useQuery } from "@tanstack/react-query";
// import { useMemo } from "react";
// import { CATEGORIES } from "@/constants/categories";
// import type {
// 	DbEquipment,
// 	GroupedEquipment,
// 	OwnershipType,
// 	SupabaseImage,
// } from "@/core/domain/entities/Equipment";
// import { createClient } from "@/lib/supabase/client";

// type useEquipmentType = {
// 	search?: string;
// 	categorySlug?: string;
// 	minPrice?: number;
// 	maxPrice?: number;
// 	limit?: number;
// 	group?: boolean;
// };

// export function useEquipment(
// 	filters: useEquipmentType,
// 	initialData?: GroupedEquipment[]
// ) {
// 	const supabase = createClient();
// 	const memoFilters = useMemo(
// 		() => ({
// 			search: filters.search?.trim() || undefined,
// 			categorySlug: filters.categorySlug || "all",
// 			limit: filters.limit,
// 			group: filters.group ?? true,
// 		}),
// 		[filters.search, filters.categorySlug, filters.limit, filters.group]
// 	);

// 	return useQuery({
// 		queryKey: ["equipment", memoFilters],
// 		queryFn: async () => {
// 			let query = supabase.from("equipment").select(`
//         *,
//         equipment_image_links(images(id, url))
//       `);

// 			// search by name
// 			if (memoFilters.search) {
// 				query = query.ilike("title", `%${memoFilters.search}%`);
// 			}

// 			// filter by category (skip if "all")
// 			if (memoFilters.categorySlug && memoFilters.categorySlug !== "all") {
// 				const cat = CATEGORIES.find((c) => c.slug === memoFilters.categorySlug);
// 				if (cat) query = query.eq("category", cat.id);
// 			}

// 			if (memoFilters.limit) query = query.limit(memoFilters.limit);

// 			const { data, error } = await query;
// 			if (error) throw error;

// 			const dbItems = (data as unknown as DbEquipment[]) || [];

// 			// for images helper
// 			const extractImages = (item: DbEquipment): SupabaseImage[] => {
// 				if (
// 					!item.equipment_image_links ||
// 					!Array.isArray(item.equipment_image_links)
// 				) {
// 					return [];
// 				}
// 				return item.equipment_image_links
// 					.map((link) => link.images)
// 					.filter((img): img is SupabaseImage => Boolean(img?.url));
// 			};

// 			// for non-grouped view (ADMIN TABLE)
// 			if (!memoFilters.group) {
// 				return dbItems.map((item) => {
// 					const imagesData = extractImages(item);

// 					return {
// 						...item,
// 						imageUrl: imagesData[0]?.url || "/placeholder-equipment.png",
// 						images: imagesData.map((img) => img.url),
// 						images_data: imagesData,
// 						total_count: 1,
// 						available_count: item.is_available ? 1 : 0,
// 						all_unit_ids: [item.id],
// 						comments: item.comments || [],
// 					} as unknown as GroupedEquipment;
// 				});
// 			}

// 			// GROUPED VIEW
// 			const groupedMap = dbItems.reduce<Record<string, GroupedEquipment>>(
// 				(acc, item) => {
// 					const title = item.title;
// 					const imagesData = extractImages(item);
// 					const imageUrls = imagesData.map((img) => img.url);

// 					if (!acc[title]) {
// 						acc[title] = {
// 							...item,
// 							description: item.description || "Нет описания",
// 							ownership_type: item.ownership_type as OwnershipType,
// 							status: "available",
// 							kit: item.kit_description,
// 							related_ids: item.related_ids || [],
// 							imageUrl: imageUrls[0] || "/placeholder-equipment.png",
// 							images: imageUrls,
// 							rating: 5.0,
// 							reviewsCount: 0,
// 							specifications:
// 								(item.specifications as Record<string, string>) || {},
// 							images_data: imagesData,
// 							total_count: 0,
// 							available_count: 0,
// 							all_unit_ids: [],
// 							comments: item.comments || [],
// 						};
// 					}

// 					const group = acc[title];

// 					group.total_count += 1;
// 					group.all_unit_ids.push(item.id);

// 					if (item.status === "available" && item.is_available) {
// 						group.available_count += 1;
// 					}

// 					// Проверяем и обновляем картинку в группе, если у текущей она есть, а в группе нет (или заглушка)
// 					if (
// 						imageUrls.length > 0 &&
// 						(!group.imageUrl || group.imageUrl.includes("placeholder"))
// 					) {
// 						group.imageUrl =
// 							imageUrls[0] || "/public/placeholder-equipment.png";
// 						group.images = imageUrls;
// 						group.images_data = imagesData;
// 					}

// 					return acc;
// 				},
// 				{}
// 			);

// 			return Object.values(groupedMap);
// 		},
// 		initialData,
// 		enabled: true,
// 		staleTime: 1000 * 60 * 5,
// 		retry: 1,
// 	});
// }
