"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Submit booking (replaces createBookingAction) ─────────────────────────────

export async function submitBookingAction(formData: {
	items: {
		id: string;
		price_to_pay: number;
		deposit?: number;
		replacement_value?: number;
	}[];
	startDate: string;
	endDate: string;
	totalPrice: number;
	hasInsurance: boolean;
	totalReplacementValue: number;
}): Promise<{ success: boolean; bookingId?: string; error?: string }> {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) return { success: false, error: "Не авторизован" };

	const { data: booking, error: bookingError } = await supabase
		.from("bookings")
		.insert({
			user_id: user.id,
			start_date: formData.startDate,
			end_date: formData.endDate,
			total_amount: formData.totalPrice,
			insurance_included: formData.hasInsurance,
			total_replacement_value: formData.totalReplacementValue,
			status: "pending_review", // ← new status name
		})
		.select("id")
		.single();

	if (bookingError) return { success: false, error: bookingError.message };

	const itemsToInsert = formData.items.map((item) => ({
		booking_id: booking.id,
		equipment_id: item.id,
		price_at_booking: item.price_to_pay,
		deposit_at_booking: item.deposit ?? 0,
		replacement_value_at_booking: item.replacement_value ?? 0,
	}));

	const { error: itemsError } = await supabase
		.from("booking_items")
		.insert(itemsToInsert);

	if (itemsError) {
		// Rollback the header row so we don't leave orphans
		await supabase.from("bookings").delete().eq("id", booking.id);
		return {
			success: false,
			error: `Ошибка записи позиций: ${itemsError.message}`,
		};
	}

	revalidatePath("/dashboard/bookings");
	return { success: true, bookingId: booking.id };
}

// ── Cancel booking ────────────────────────────────────────────────────────────

export async function cancelBookingAction(
	bookingId: string,
	reason: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) return { success: false, error: "Не авторизован" };

	// Verify ownership
	const { data: booking } = await supabase
		.from("bookings")
		.select("id, user_id, status")
		.eq("id", bookingId)
		.single();

	if (!booking || booking.user_id !== user.id) {
		return { success: false, error: "Заказ не найден" };
	}
	if (booking.status === "active" || booking.status === "completed") {
		return {
			success: false,
			error: "Нельзя отменить активный или завершённый заказ",
		};
	}

	const { error } = await supabase
		.from("bookings")
		.update({
			status: "cancelled",
			cancellation_reason: reason,
			cancelled_at: new Date().toISOString(),
		})
		.eq("id", bookingId);

	if (error) return { success: false, error: error.message };

	// Notify admins
	await supabase.from("admin_notifications").insert({
		type: "booking_cancelled",
		user_id: user.id,
		payload: { booking_id: bookingId, reason },
		is_read: false,
	});

	revalidatePath(`/dashboard/bookings/${bookingId}`);
	revalidatePath("/dashboard/bookings");
	return { success: true };
}

// ── Update booking dates ──────────────────────────────────────────────────────

export async function updateBookingDatesAction(
	bookingId: string,
	startDate: string,
	endDate: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) return { success: false, error: "Не авторизован" };

	const { data: booking } = await supabase
		.from("bookings")
		.select("id, user_id, status")
		.eq("id", bookingId)
		.single();

	if (!booking || booking.user_id !== user.id) {
		return { success: false, error: "Заказ не найден" };
	}
	if (!["pending_review", "ready_to_rent"].includes(booking.status)) {
		return { success: false, error: "Нельзя изменить даты на данном этапе" };
	}

	const { error } = await supabase
		.from("bookings")
		.update({
			start_date: startDate,
			end_date: endDate,
			// Changing dates resets approval — manager must re-confirm
			status: "pending_review",
			updated_at: new Date().toISOString(),
		})
		.eq("id", bookingId);

	if (error) return { success: false, error: error.message };

	await supabase.from("admin_notifications").insert({
		type: "booking_dates_changed",
		user_id: user.id,
		payload: {
			booking_id: bookingId,
			start_date: startDate,
			end_date: endDate,
		},
		is_read: false,
	});

	revalidatePath(`/dashboard/bookings/${bookingId}`);
	return { success: true };
}

// ── Check availability ────────────────────────────────────────────────────────
// excludeBookingId — исключает текущий заказ из проверки конфликтов
// (нужно при редактировании существующего заказа)

export async function checkAvailabilityAction(
	equipmentIds: string[],
	startDate: string,
	endDate: string,
	excludeBookingId?: string
): Promise<{ busyIds: string[]; error?: string }> {
	const supabase = await createClient();

	let query = supabase
		.from("booking_items")
		.select("equipment_id, bookings!inner(id, start_date, end_date, status)")
		.in("equipment_id", equipmentIds)
		.filter("bookings.start_date", "lte", endDate)
		.filter("bookings.end_date", "gte", startDate)
		.not("bookings.status", "eq", "cancelled");

	if (excludeBookingId) {
		query = query.not("bookings.id", "eq", excludeBookingId);
	}

	const { data, error } = await query;
	if (error) return { busyIds: [], error: error.message };

	const busyIds = [...new Set(data.map((item) => item.equipment_id as string))];
	return { busyIds };
}

// ── Update booking items ──────────────────────────────────────────────────────

export async function updateBookingItemsAction(
	bookingId: string,
	payload: {
		items: { equipment_id: string; quantity: number; price_per_unit: number }[];
		totalAmount: number;
		totalReplacementValue: number;
	}
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) return { success: false, error: "Не авторизован" };

	const { data: booking } = await supabase
		.from("bookings")
		.select("id, user_id, status")
		.eq("id", bookingId)
		.single();

	if (!booking || booking.user_id !== user.id) {
		return { success: false, error: "Заказ не найден" };
	}
	if (["active", "completed", "cancelled"].includes(booking.status)) {
		return {
			success: false,
			error: "Нельзя изменить комплектацию на данном этапе",
		};
	}
	if (payload.items.length === 0) {
		return { success: false, error: "Нельзя сохранить пустой заказ" };
	}

	// Delete old items, re-insert new
	const { error: deleteError } = await supabase
		.from("booking_items")
		.delete()
		.eq("booking_id", bookingId);

	if (deleteError) return { success: false, error: deleteError.message };

	// Expand quantity into individual rows
	const rows = payload.items.flatMap((item) =>
		Array.from({ length: item.quantity }, () => ({
			booking_id: bookingId,
			equipment_id: item.equipment_id,
			price_at_booking: item.price_per_unit,
		}))
	);

	const { error: insertError } = await supabase
		.from("booking_items")
		.insert(rows);
	if (insertError) return { success: false, error: insertError.message };

	// Update total and reset status for re-approval
	const { error: updateError } = await supabase
		.from("bookings")
		.update({
			total_amount: payload.totalAmount,
			total_replacement_value: payload.totalReplacementValue,
			status: "pending_review",
			updated_at: new Date().toISOString(),
		})
		.eq("id", bookingId);

	if (updateError) return { success: false, error: updateError.message };

	await supabase.from("admin_notifications").insert({
		type: "booking_items_changed",
		user_id: user.id,
		payload: { booking_id: bookingId, item_count: rows.length },
		is_read: false,
	});

	revalidatePath(`/dashboard/bookings/${bookingId}`);
	revalidatePath("/dashboard/bookings");
	return { success: true };
}

// ── Admin: update booking status ──────────────────────────────────────────────

export async function updateBookingStatusAction(
	bookingId: string,
	newStatus: string
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();

	// Verify caller is admin or manager (skip for now — add RLS or role-check here)
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { success: false, error: "Не авторизован" };

	const { error } = await supabase
		.from("bookings")
		.update({
			status: newStatus,
			updated_at: new Date().toISOString(),
			// If cancelling, record the timestamp
			...(newStatus === "cancelled"
				? { cancelled_at: new Date().toISOString() }
				: {}),
		})
		.eq("id", bookingId);

	if (error) return { success: false, error: error.message };

	// Notify the client via admin_notifications if moving to a meaningful status
	const notifyStatuses = ["ready_to_rent", "wait_payment", "cancelled"];
	if (notifyStatuses.includes(newStatus)) {
		// Get the booking's user_id to attach notification
		const { data: booking } = await supabase
			.from("bookings")
			.select("user_id")
			.eq("id", bookingId)
			.single();

		if (booking) {
			await supabase.from("admin_notifications").insert({
				type: "booking_status_changed",
				user_id: booking.user_id,
				payload: { booking_id: bookingId, new_status: newStatus },
				is_read: false,
			});
		}
	}

	revalidatePath("/admin/bookings");
	revalidatePath(`/dashboard/bookings/${bookingId}`);
	return { success: true };
}
