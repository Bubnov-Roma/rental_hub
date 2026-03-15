import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type {
	DbEquipment,
	GroupedEquipment,
	OwnershipType,
	SupabaseImage,
} from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/client";

export type useEquipmentType = {
	search?: string | undefined;
	categorySlug?: string | undefined;
	subcategorySlug?: string | undefined;
	minPrice?: number | undefined;
	maxPrice?: number | undefined;
	limit?: number | undefined;
	group?: boolean | undefined;
};

const supabase = createClient();

export function useEquipment(
	filters: useEquipmentType,
	initialData?: GroupedEquipment[]
) {
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
			query = query.eq("is_available", true);

			if (memoFilters.search) {
				query = query.ilike("title", `%${memoFilters.search}%`);
			}

			if (memoFilters.categorySlug !== "all") {
				// Ищем категорию по slug в БД через join или отдельным запросом.
				// Поскольку category хранит UUID, сначала резолвим slug → UUID.
				const { data: catRow } = await supabase
					.from("categories")
					.select("id")
					.eq("slug", memoFilters.categorySlug)
					.single();

				if (catRow) {
					query = query.eq("category", catRow.id);
				}
			}

			if (memoFilters.subcategorySlug) {
				// Резолвим subcategory slug → UUID
				const { data: subRow } = await supabase
					.from("subcategories")
					.select("id")
					.eq("slug", memoFilters.subcategorySlug)
					.single();

				if (subRow) {
					query = query.eq("subcategory", subRow.id);
				}
			}

			if (memoFilters.limit) query = query.limit(memoFilters.limit);

			const { data, error } = await query;
			if (error) throw error;

			const dbItems = (data as unknown as DbEquipment[]) || [];

			const extractImages = (item: DbEquipment): SupabaseImage[] => {
				if (
					!item.equipment_image_links ||
					!Array.isArray(item.equipment_image_links)
				)
					return [];
				return item.equipment_image_links
					.map((link) => link.images)
					.filter((img): img is SupabaseImage => Boolean(img?.url));
			};

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
					if (item.status === "available" && item.is_available)
						group.available_count += 1;
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
		staleTime: 1000 * 60 * 3,
		gcTime: 1000 * 60 * 10,
		refetchOnWindowFocus: false,
		retry: 1,
	});
}
