"use client";

import { useEffect, useState } from "react";
import type { Equipment } from "@/core/domain/entities/Equipment";
import { createClient } from "@/lib/supabase/client";

export function useEquipmentDetails(id: string) {
	const [equipment, setEquipment] = useState<Equipment | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [availability, setAvailability] = useState<{ bookedDates: Date[] }>({
		bookedDates: [],
	});
	const supabase = createClient();

	useEffect(() => {
		async function fetchEquipmentDetails() {
			try {
				setIsLoading(true);

				// Get equipment
				const { data: equipmentData, error: equipmentError } = await supabase
					.from("equipment")
					.select(`
            *,
            equipment_images(url, order_index),
            reviews(rating, comment, created_at, user:users(name))
          `)
					.eq("id", id)
					.single();

				if (equipmentError) throw equipmentError;

				// Get booking date
				const { data: bookingsData } = await supabase
					.from("bookings")
					.select("start_date, end_date")
					.eq("equipment_id", id)
					.neq("status", "cancelled")
					.gte("end_date", new Date().toISOString());

				const bookedDates: Date[] = [];
				bookingsData?.forEach((booking) => {
					const start = new Date(booking.start_date);
					const end = new Date(booking.end_date);
					const current = new Date(start);

					while (current <= end) {
						bookedDates.push(new Date(current));
						current.setDate(current.getDate() + 1);
					}
				});

				const transformedEquipment = {
					...equipmentData,
					imageUrl:
						equipmentData.equipment_images?.[0]?.url ||
						"/placeholder-equipment.jpg",
					rating: equipmentData.reviews?.length
						? equipmentData.reviews.reduce(
								(acc: number, review: { rating: number }) =>
									acc + review.rating,
								0
							) / equipmentData.reviews.length
						: 4.5,
					reviewsCount: equipmentData.reviews?.length || 0,
					images:
						equipmentData.equipment_images?.map(
							(img: { url: string }) => img.url
						) || [],
				};

				setEquipment(transformedEquipment);
				setAvailability({ bookedDates });
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Ошибка загрузки оборудования"
				);
			} finally {
				setIsLoading(false);
			}
		}

		if (id) {
			fetchEquipmentDetails();
		}
	}, [id, supabase.from]);

	return { equipment, isLoading, error, availability, supabase };
}
