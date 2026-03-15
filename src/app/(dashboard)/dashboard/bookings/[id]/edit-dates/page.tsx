import { notFound, redirect } from "next/navigation";
import { EditDatesClient } from "@/components/dashboard/bookings/EditDatesClient";
import { createClient } from "@/lib/supabase/server";
import { toBookingDetailRow } from "@/types/booking.types";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function EditDatesPage({ params }: Props) {
	const { id } = await params;
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/auth");

	const { data: raw } = await supabase
		.from("bookings")
		.select(`
			id, user_id, start_date, end_date, total_amount, status,
			created_at, updated_at, total_replacement_value,
			insurance_included, cancellation_reason, cancelled_at,
			booking_items (
				id, price_at_booking, deposit_at_booking,
				replacement_value_at_booking,
				equipment ( id, title, category, price_4h, price_8h, price_per_day, deposit )
			)
		`)
		.eq("id", id)
		.eq("user_id", user.id)
		.single();

	if (!raw) notFound();

	const booking = toBookingDetailRow(raw);

	// Only editable if not yet active/completed/cancelled
	if (["active", "completed", "cancelled"].includes(booking.status)) {
		redirect(`/dashboard/bookings/${id}`);
	}

	return <EditDatesClient booking={booking} />;
}
