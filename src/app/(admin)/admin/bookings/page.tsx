import type { AdminBookingRow } from "@/components/admin/bookings/AdminBookingsTable";
import AdminBookingsTable from "@/components/admin/bookings/AdminBookingsTable";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBookingsPage() {
	const supabase = await createClient();

	// ── Expire overdue bookings before rendering ──────────────────────────────
	// Calls the DB function from migration_admin_access_v3.sql.
	// If pg_cron is not available this is the fallback — runs on every page load.
	// await supabase.rpc("expire_overdue_bookings").catch(() => {
	// 	// Ignore if function doesn't exist yet
	// });

	// ── Fetch bookings with profile + equipment joins ─────────────────────────
	// bookings → profiles  via FK bookings_user_id_fkey
	// bookings → booking_items → equipment via booking_id / equipment_id FK
	const { data: raw, error } = await supabase
		.from("bookings")
		.select(`
			id,
			status,
			total_amount,
			created_at,
			start_date,
			end_date,
			insurance_included,
			total_replacement_value,
			cancellation_reason,
			cancelled_at,
			profiles!bookings_user_id_fkey ( name, email ),
			booking_items (
				equipment:equipment_id ( id, title )
			)
		`)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("[AdminBookingsPage] query error:", error.message);
	}

	// ── Normalise into AdminBookingRow[] ─────────────────────────────────────

	const initialBookings: AdminBookingRow[] = (raw ?? []).map((row) => {
		const profileArr = Array.isArray(row.profiles)
			? row.profiles
			: row.profiles
				? [row.profiles]
				: [];
		const profile = profileArr[0] as
			| { name: string | null; email: string | null }
			| undefined;

		// booking_items → each item has an `equipment` that is also an array or object
		type RawItem = {
			equipment:
				| { id: string; title: string }[]
				| { id: string; title: string }
				| null;
		};
		const items = (row.booking_items ?? []) as RawItem[];

		const equipmentTitles: string[] = items
			.map((item) => {
				if (!item.equipment) return null;
				if (Array.isArray(item.equipment))
					return item.equipment[0]?.title ?? null;
				return (item.equipment as { title: string }).title ?? null;
			})
			.filter((t): t is string => t !== null);

		return {
			id: row.id,
			status: row.status as AdminBookingRow["status"],
			total_amount: row.total_amount,
			created_at: row.created_at,
			start_date: row.start_date,
			end_date: row.end_date,
			insurance_included: row.insurance_included ?? null,
			total_replacement_value: row.total_replacement_value ?? null,
			cancellation_reason: row.cancellation_reason ?? null,
			cancelled_at: row.cancelled_at ?? null,
			client_name: profile?.name ?? null,
			client_email: profile?.email ?? null,
			equipment_titles: equipmentTitles,
			item_count: items.length,
		} satisfies AdminBookingRow;
	});

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-black italic uppercase tracking-tight">
					Бронирования
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Управление заявками · {initialBookings.length} всего
				</p>
			</div>
			<AdminBookingsTable initialBookings={initialBookings} />
		</div>
	);
}
