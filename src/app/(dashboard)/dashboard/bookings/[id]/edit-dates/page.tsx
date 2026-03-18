import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { EditDatesClient } from "@/components/dashboard/bookings/EditDatesClient";
import { prisma } from "@/lib/prisma";
import { toBookingDetailRow } from "@/types/booking.types";

interface Props {
	params: Promise<{ id: string }>;
}

export default async function EditDatesPage({ params }: Props) {
	const { id } = await params;
	const session = await auth();

	if (!session?.user?.id) redirect("/auth");

	const raw = await prisma.booking.findUnique({
		where: { id, userId: session.user.id },
		include: {
			bookingItems: {
				include: {
					equipment: {
						select: {
							id: true,
							title: true,
							categoryId: true,
							price4h: true,
							price8h: true,
							pricePerDay: true,
							deposit: true,
						},
					},
				},
			},
		},
	});

	if (!raw) notFound();

	const booking = toBookingDetailRow(raw);

	if (["ACTIVE", "COMPLETED", "CANCELLED", "EXPIRED"].includes(booking.status))
		redirect(`/dashboard/bookings/${id}`);

	return <EditDatesClient booking={booking} />;
}
