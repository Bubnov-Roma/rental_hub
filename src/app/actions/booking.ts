"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBookingAction(formData: {
	items: { id: string; price_to_pay: number }[];
	startDate: string;
	endDate: string;
	totalPrice: number;
	hasInsurance: boolean;
	totalReplacementValue: number;
}) {
	const supabase = await createClient();

	// 1. Проверяем авторизацию
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) return { error: "Login required" };

	const { data: booking, error: bookingError } = await supabase
		.from("bookings")
		.insert({
			user_id: user.id,
			start_date: formData.startDate,
			end_date: formData.endDate,
			total_amount: formData.totalPrice,
			insurance_included: formData.hasInsurance,
			total_replacement_value: formData.totalReplacementValue,
			status: "pending",
		})
		.select()
		.single();

	if (bookingError) return { error: bookingError.message };

	// 3. Создаем записи для каждого предмета с фиксацией цены
	const itemsToInsert = formData.items.map((item) => ({
		booking_id: booking.id,
		equipment_id: item.id,
		price_at_booking: item.price_to_pay,
	}));

	const { error: itemsError } = await supabase
		.from("booking_items")
		.insert(itemsToInsert);

	if (itemsError) {
		// В идеале тут нужно "откатить" заголовок, если позиции не записались
		return { error: "Ошибка записи позиций: " + itemsError.message };
	}

	revalidatePath("/cart");
	revalidatePath("/bookings");
	return { success: true, bookingId: booking.id };
}

export async function checkAvailabilityAction(
	equipmentIds: string[],
	startDate: string,
	endDate: string
) {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("booking_items")
		.select("equipment_id, bookings!inner(start_date, end_date)")
		.in("equipment_id", equipmentIds)
		.filter("bookings.start_date", "lte", endDate)
		.filter("bookings.end_date", "gte", startDate);

	if (error) return { error: error.message };

	const busyIds = data.map((item) => item.equipment_id);
	return { busyIds };
}
