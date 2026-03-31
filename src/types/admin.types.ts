import { Prisma } from "@prisma/client";

const recentBookingsPayload = Prisma.validator<Prisma.BookingDefaultArgs>()({
	include: {
		user: { select: { name: true, email: true } },
		bookingItems: { include: { equipment: { select: { title: true } } } },
	},
});

export type RecentBooking = Prisma.BookingGetPayload<
	typeof recentBookingsPayload
>;

export type DashboardCategory = {
	id: string;
	name: string;
	slug: string;
};

export interface AdminDashboardData {
	totalUsers: number;
	totalEquipment: number;
	totalBookings: number;
	pendingBookings: number;
	totalRevenue: number;
	monthlyRevenue: number;
	recentBookings: RecentBooking[];
	categories: DashboardCategory[];
	faqCount: number;
}
