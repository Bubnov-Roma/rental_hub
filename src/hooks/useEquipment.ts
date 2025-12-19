import { useEffect, useState } from "react";
import type { Equipment } from "@/core/domain/entities/Equipment";
import { supabase } from "@/lib/supabase";

interface UseEquipmentProps {
	search?: string;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
	limit?: number;
}

export function useEquipment({
	search = "",
	category = "all",
	minPrice = 0,
	maxPrice = 100000,
	limit = 20,
}: UseEquipmentProps = {}) {
	const [equipment, setEquipment] = useState<Equipment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchEquipment() {
			try {
				setIsLoading(true);

				let query = supabase
					.from("equipment")
					.select(`
            *,
            equipment_images(url),
            reviews(rating)
          `)
					.limit(limit);

				if (search) {
					query = query.ilike("title", `%${search}%`);
				}

				if (category !== "all") {
					query = query.eq("category", category);
				}

				query = query
					.gte("price_per_day", minPrice)
					.lte("price_per_day", maxPrice)
					.eq("is_available", true);

				const { data, error: supabaseError } = await query;

				if (supabaseError) throw supabaseError;

				const transformedData = (data || []).map((item) => ({
					...item,
					imageUrl: item.equipment_images?.[0]?.url || "/placeholder-equipment.jpg",
					rating: item.reviews?.length
						? item.reviews.reduce(
								(acc: number, review: { rating: number }) => acc + review.rating,
								0
							) / item.reviews.length
						: 4.5,
					reviewsCount: item.reviews?.length || 0,
				}));

				setEquipment(transformedData);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Ошибка загрузки оборудования");
			} finally {
				setIsLoading(false);
			}
		}

		fetchEquipment();
	}, [search, category, minPrice, maxPrice, limit]);

	return { equipment, isLoading, error };
}
