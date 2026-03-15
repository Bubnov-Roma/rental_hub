import { notFound, redirect } from "next/navigation";
import { getSupportInfo } from "@/actions/support-actions";
import { BookingDetailClient } from "@/components/dashboard/bookings/BookingDetailClient";
import { createClient } from "@/lib/supabase/server";
import { toBookingDetailRow } from "@/types";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: Props) {
	const supabase = await createClient();
	const { id } = await params;

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/auth");

	const { data: raw } = await supabase
		.from("bookings")
		.select(`
			id,
			user_id,
			start_date,
			end_date,
			total_amount,
			status,
			created_at,
			updated_at,
			total_replacement_value,
			insurance_included,
			cancellation_reason,
			cancelled_at,
			booking_items (
				id,
				price_at_booking,
				deposit_at_booking,
				replacement_value_at_booking,
				equipment (
					id,
					title,
					category,
					price_4h,
					price_8h,
					price_per_day,
					deposit
				)
			)
		`)
		.eq("id", id)
		.eq("user_id", user.id)
		.single();

	if (!raw) notFound();

	const support = await getSupportInfo();

	return (
		<BookingDetailClient booking={toBookingDetailRow(raw)} support={support} />
	);
}
