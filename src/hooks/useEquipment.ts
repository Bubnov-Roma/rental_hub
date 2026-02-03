import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "@/constants/categories";
import type {
	GroupedEquipment,
	OwnershipType,
} from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/client";

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
	images: { url: string }[];
}

export function useEquipment(
	filters: {
		search?: string;
		categorySlug?: string;
		minPrice?: number;
		maxPrice?: number;
		limit?: number;
	} = {}
) {
	const supabase = createClient();

	return useQuery<GroupedEquipment[]>({
		queryKey: ["equipment", filters],
		queryFn: async () => {
			let query = supabase.from("equipment").select(`
          *,
          images!images_equipment_id_fkey(url)
        `);

			if (filters.search) query = query.ilike("title", `%${filters.search}%`);

			if (filters.categorySlug && filters.categorySlug !== "all") {
				const cat = CATEGORIES.find((c) => c.slug === filters.categorySlug);
				if (cat) query = query.eq("category", cat.id);
			}

			if (filters.minPrice)
				query = query.gte("price_per_day", filters.minPrice);
			if (filters.maxPrice)
				query = query.lte("price_per_day", filters.maxPrice);

			if (filters.limit) query = query.limit(filters.limit);

			const { data, error } = await query;
			if (error) throw error;

			const dbItems = (data as unknown as DbEquipment[]) || [];
			const groupedMap = dbItems.reduce<Record<string, GroupedEquipment>>(
				(acc, item) => {
					const title = item.title;
					if (!acc[title]) {
						acc[title] = {
							id: item.id,
							title: item.title,
							description: item.description || "Нет описания",
							category: item.category,
							subcategory: item.subcategory,
							inventory_number: item.inventory_number,
							price_per_day: item.price_per_day,
							price_4h: item.price_4h,
							price_8h: item.price_8h,
							deposit: item.deposit,
							replacement_value: item.replacement_value,
							ownership_type: item.ownership_type as OwnershipType,
							status: "available",
							is_available: item.is_available,
							partner_name: item.partner_name,
							defects: item.defects,
							kit: item.kit_description,
							related_ids: item.related_ids || [],
							imageUrl: item.images?.[0]?.url || "/placeholder-equipment.png",
							images: item.images?.map((img) => img.url) || [],
							rating: 5.0,
							reviewsCount: 0,
							specifications: item.specifications || {},
							created_at: item.created_at,
							updated_at: item.updated_at,
							total_count: 0,
							available_count: 0,
							all_unit_ids: [],
						};
					}
					acc[title].total_count += 1;
					acc[title].all_unit_ids.push(item.id);
					if (item.status === "available" && item.is_available)
						acc[title].available_count += 1;
					return acc;
				},
				{}
			);
			return Object.values(groupedMap);
		},
		enabled: Boolean(
			filters.categorySlug || (filters.search && filters.search.length > 0)
		),
		staleTime: 1000 * 60 * 5,
	});
}
