import { createClient } from "@/lib/supabase/server";

export async function getAdminStats() {
	const supabase = await createClient();

	const [
		usersCount,
		equipmentCount,
		bookingsCount,
		revenueData,
		recentBookingsData,
	] = await Promise.all([
		// 1. Users count
		supabase
			.from("profiles")
			.select("*", { count: "exact", head: true }),

		// 2. Equipment
		supabase
			.from("equipment")
			.select("*", { count: "exact", head: true }),

		// 3. Bookings
		supabase
			.from("bookings")
			.select("*", { count: "exact", head: true }),

		// 4. Total amount
		supabase
			.from("bookings")
			.select("total_amount")
			.eq("status", "completed"),

		supabase.from("profiles").select("*", { count: "exact", head: true }),
		supabase.from("equipment").select("*", { count: "exact", head: true }),
		supabase.from("bookings").select("*", { count: "exact", head: true }),
		supabase.from("bookings").select("total_amount").eq("status", "completed"),

		// 5. Join
		supabase
			.from("bookings")
			.select(`
        id,
        total_amount,
        status,
        created_at,
        user:profiles!inner(name, email),
        equipment:equipment!inner(title)
      `)
			.order("created_at", { ascending: false })
			.limit(5),
	]);

	// Total revenue
	const totalRevenue =
		revenueData.data?.reduce((acc, b) => acc + (b.total_amount || 0), 0) || 0;

	const monthlyRevenue = totalRevenue * 0.21;

	return {
		totalUsers: usersCount.count || 0,
		totalEquipment: equipmentCount.count || 0,
		totalBookings: bookingsCount.count || 0,
		totalRevenue,
		monthlyRevenue,
		recentBookings: recentBookingsData.data || [],
	};
}
