import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CATEGORIES } from "@/constants/categories";
import type {
	GroupedEquipment,
	OwnershipType,
} from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/client";

export interface SupabaseImage {
	id: string;
	url: string;
}

interface SupabaseLink {
	images: SupabaseImage | null;
}

interface DbEquipment {
	id: string;
	title: string;
	description: string | null;
	price_per_day: number;
	price_4h: number;
	price_8h: number;
	category: string;
	subcategory: string | null;
	is_available: boolean;
	inventory_number: string | null;
	deposit: number;
	replacement_value: number;
	status: string;
	defects: string | null;
	kit_description: string | null;
	ownership_type: string;
	partner_name: string | null;
	related_ids: string[] | null;
	specifications: Record<string, unknown> | null;
	created_at: string;
	updated_at: string;
	equipment_image_links: SupabaseLink[];
	images_data: SupabaseImage[];
}

export function useEquipment(
	filters: {
		search?: string;
		categorySlug?: string;
		minPrice?: number;
		maxPrice?: number;
		limit?: number;
		group?: boolean;
	} = {}
) {
	const supabase = createClient();
	const memoFilters = useMemo(
		() => ({
			search: filters.search?.trim() || undefined,
			categorySlug: filters.categorySlug || "all",
			limit: filters.limit,
			group: filters.group ?? true,
		}),
		[filters.search, filters.categorySlug, filters.limit, filters.group]
	);

	return useQuery<GroupedEquipment[]>({
		queryKey: ["equipment", memoFilters],
		queryFn: async () => {
			let query = supabase.from("equipment").select(`
        *,
        equipment_image_links(images(id, url))
      `);
			// search by name
			if (memoFilters.search) {
				query = query.ilike("title", `%${memoFilters.search}%`);
			}

			// filter by category (skip if "all")
			if (memoFilters.categorySlug && memoFilters.categorySlug !== "all") {
				const cat = CATEGORIES.find((c) => c.slug === memoFilters.categorySlug);
				if (cat) query = query.eq("category", cat.id);
			}
			if (memoFilters.limit) query = query.limit(memoFilters.limit);
			const { data, error } = await query;
			if (error) throw error;
			const dbItems = (data as unknown as DbEquipment[]) || [];
			// for non-grouped view (ADMIN TABLE)
			if (!memoFilters.group) {
				return dbItems.map((item) => {
					const imagesData =
						item.equipment_image_links
							?.map((l) => l.images)
							.filter((img): img is SupabaseImage => Boolean(img)) || [];

					return {
						...item,
						imageUrl: imagesData[0]?.url || "/placeholder-equipment.png",
						images: imagesData.map((img) => img.url),
						images_data: imagesData,
						total_count: 1,
						available_count: item.is_available ? 1 : 0,
						all_unit_ids: [item.id],
					} as unknown as GroupedEquipment;
				});
			}
			const groupedMap = dbItems.reduce<Record<string, GroupedEquipment>>(
				(acc, item) => {
					const title = item.title;
					const imageUrls: string[] = item.equipment_image_links
						.map((link) => link.images?.url)
						.filter((url): url is string => Boolean(url));
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
							images_data: item.images_data,
							total_count: 0,
							available_count: 0,
							all_unit_ids: [],
						};
					}
					acc[title].total_count += 1;
					acc[title].all_unit_ids.push(item.id);
					if (item.status === "available" && item.is_available) {
						acc[title].available_count += 1;
					}
					return acc;
				},
				{}
			);
			return Object.values(groupedMap);
		},
		enabled: true,
		staleTime: 1000 * 60 * 5,
		retry: 1,
	});
}
