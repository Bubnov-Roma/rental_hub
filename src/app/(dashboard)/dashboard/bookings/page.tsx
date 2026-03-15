import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BookingsTable } from "@/components/dashboard/bookings/BookingsTable";
import { DashboardBreadcrumb } from "@/components/dashboard/DashboardBreadcrumb";
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

	const bookings = (raw ?? []) as unknown as BookingRow[];

	return (
		<div className="min-h-screen">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
				<DashboardBreadcrumb items={[{ label: "Мои заказы" }]} />
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<Link
							href="/dashboard"
							className="w-10 h-10 rounded-xl border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-all shrink-0"
						>
							<ArrowLeft size={18} />
						</Link>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
								История аренды
							</p>
							<h1 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">
								Мои заказы
							</h1>
						</div>
					</div>
				</div>
				<BookingsTable bookings={bookings} />
			</div>
		</div>
	);
}
