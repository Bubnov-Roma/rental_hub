import { useQuery } from "@tanstack/react-query";
import type { Equipment } from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/client";

interface EquipmentFilters {
	search?: string;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
}

export function useEquipment(filters: EquipmentFilters = {}) {
	const supabase = createClient();

	return useQuery({
		queryKey: ["equipment", filters],
		queryFn: async () => {
			let query = supabase
				.from("equipment")
				.select(`
          *,
          equipment_images(url),
          reviews(rating)
        `)
				.eq("is_available", true);

			if (filters.search) {
				query = query.ilike("title", `%${filters.search}%`);
			}
			if (filters.category && filters.category !== "all") {
				query = query.eq("category", filters.category);
			}
			if (filters.minPrice)
				query = query.gte("price_per_day", filters.minPrice);
			if (filters.maxPrice)
				query = query.lte("price_per_day", filters.maxPrice);

			const { data, error } = await query;
			if (error) throw error;

			return (data || []).map((item) => ({
				...item,
				imageUrl: item.equipment_images?.[0]?.url || "/placeholder.jpg",
				rating: item.reviews?.length
					? item.reviews.reduce(
							(acc: number, r: Equipment) => acc + r.rating,
							0
						) / item.reviews.length
					: 5.0,
			})) as Equipment[];
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}
