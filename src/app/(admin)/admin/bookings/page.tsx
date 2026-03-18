import type { AdminBookingRow } from "@/components/admin/bookings/AdminBookingsTable";
import AdminBookingsTable from "@/components/admin/bookings/AdminBookingsTable";
import { prisma } from "@/lib/prisma";

export default async function AdminBookingsPage() {
	const rawBookings = await prisma.booking.findMany({
		orderBy: { createdAt: "desc" },
		include: {
			user: { select: { name: true, email: true } },
			bookingItems: {
				include: {
					equipment: { select: { id: true, title: true } },
				},
			},
		},
	});

	const initialBookings: AdminBookingRow[] = rawBookings.map((row) => {
		const equipmentTitles = row.bookingItems
			.map((item) => item.equipment?.title ?? null)
			.filter((t): t is string => t !== null);

		return {
			id: row.id,
			status: row.status as AdminBookingRow["status"],
			totalAmount: row.totalAmount,
			createdAt: row.createdAt.toISOString(),
			startDate: row.startDate.toISOString(),
			endDate: row.endDate.toISOString(),
			insuranceIncluded: row.insuranceIncluded ?? null,
			totalReplacementValue: row.totalReplacementValue ?? null,
			cancellationReason: row.cancellationReason ?? null,
			cancelledAt: row.cancelledAt?.toISOString() ?? null,
			clientName: row.user.name ?? null,
			clientEmail: row.user.email ?? null,
			equipmentTitles: equipmentTitles,
			itemCount: row.bookingItems.length,
		};
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
