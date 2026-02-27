import { BookingsTable } from "@/components/dashboard/bookings/BookingsTable";
import { createClient } from "@/lib/supabase/server";
import type { BookingRow } from "@/types";

export default async function BookingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

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
			total_replacement_value,
			insurance_included,
			booking_items (
				id,
				price_at_booking,
				deposit_at_booking,
				replacement_value_at_booking,
				equipment (
					title,
					category,
					price_4h,
					price_8h,
					price_per_day
				)
			)
		`)
		.eq("user_id", user?.id ?? "")
		.order("created_at", { ascending: false });

	// Cast to our strict type — Supabase inference is sometimes too wide
	const bookings = (raw ?? []) as unknown as BookingRow[];

	const totalBookings = bookings.length;
	// const totalSpent = bookings.reduce(
	// 	(acc, b) => acc + (b.total_amount || 0),
	// 	0
	// );

	return (
		<div className="min-h-screen">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
				{/* Header */}
				<div className="space-y-1">
					<h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter">
						Мои заказы
					</h1>
					<p className="text-muted-foreground text-sm">
						История и статусы аренды
					</p>
				</div>

				{/* Stats */}
				<div className="flex gap-4 sm:gap-8">
					<div>
						<div className="text-2xl sm:text-3xl font-black tabular-nums">
							{totalBookings}
						</div>
						<div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
							Всего заказов
						</div>
					</div>
					<div className="w-px bg-border" />
					{/* <div>
						<div className="text-2xl sm:text-3xl font-black tabular-nums">
							{totalSpent.toLocaleString()} ₽
						</div>
						<div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
							Потрачено
						</div>
					</div> */}
				</div>
				<BookingsTable bookings={bookings} />
			</div>
		</div>
	);
}
