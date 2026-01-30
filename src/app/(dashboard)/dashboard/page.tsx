import {
	ArrowRight,
	Calendar,
	Clock,
	Package,
	Star,
	TrendingUp,
	User,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { VerificationBanner } from "@/components/forms/verification/VerificationBanner";
import { QuickActionLink } from "@/components/shared/QuickActionLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/auth/login");

	const { data: application } = await supabase
		.from("client_applications")
		.select("status")
		.eq("user_id", user.id)
		.maybeSingle();

	const showBanner = application?.status === "no_application";

	console.log("showBanner", showBanner, "application", application?.status);
	// Load data in parallel for better performance
	const [
		{ data: bookingsData },
		{ count: totalBookings },
		{ count: activeBookings },
		{ data: spendingData },
	] = await Promise.all([
		// User reservations
		supabase
			.from("bookings")
			.select(`
				*,
				equipment:equipment(*)
			`)
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(5),

		// Total number of bookings
		supabase
			.from("bookings")
			.select("*", { count: "exact", head: true })
			.eq("user_id", user.id),

		// Active bookings
		supabase
			.from("bookings")
			.select("*", { count: "exact", head: true })
			.eq("user_id", user.id)
			.in("status", ["pending", "confirmed", "active"]),

		// Funds spent (completed bookings only)
		supabase
			.from("bookings")
			.select("total_amount")
			.eq("user_id", user.id)
			.eq("status", "completed"),
	]);

	// Calculate the total amount of money spent
	const totalSpent =
		spendingData?.reduce(
			(acc, item: { total_amount: number }) => acc + (item.total_amount || 0),
			0
		) || 0;

	// const [bookings, totalBookings, activeBookings, spendingData] =
	// await Promise.all([
	// prisma.booking.findMany({
	// 	where: { userId: user.id },
	// 	include: { equipment: true },
	// 	orderBy: { createdAt: "desc" },
	// 	take: 5,
	// }),
	// prisma.booking.count({ where: { userId: user.id } }),
	// prisma.booking.count({
	// 	where: {
	// 		userId: user.id,
	// 		status: { in: ["pending", "confirmed", "active"] },
	// 	},
	// }),
	// prisma.booking.aggregate({
	// 	where: { userId: user.id, status: "completed" },
	// 	_sum: { totalAmount: true },
	// }),
	// ]);

	// const totalSpent = spendingData._sum.totalAmount || 0;

	// Preparing data for display
	const bookings = bookingsData || [];
	const stats = {
		totalBookings: totalBookings || 0,
		activeBookings: activeBookings || 0,
		totalSpent,
		rating: 4.5, // TODO: calculate value from db
	};

	return (
		<div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-8">
			{/* Приветствие */}
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div>
					<h1 className="text-4xl font-bold tracking-tight text-foreground/90">
						Привет, {user.user_metadata?.name?.split(" ")[0] || "Пользователь"}!
					</h1>
					<p className="text-muted-foreground mt-1">
						Ваш кабинет управления арендой техники.
					</p>
				</div>
				<Button
					variant="social"
					asChild
					className="rounded-2xl border-white/10 hover:bg-white/5 transition-all mr-8"
				>
					<Link href="/equipment" className="flex items-center gap-2">
						Каталог техники <ArrowRight />
					</Link>
				</Button>
			</div>

			{/* Баннер верификации */}
			{showBanner && <VerificationBanner />}

			{/* Сетка статистики в стеклянных карточках */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Всего бронирований"
					value={stats.totalBookings}
					icon={<Package />}
				/>
				<StatCard
					title="Активные аренды"
					value={stats.activeBookings}
					icon={<Calendar />}
				/>
				<StatCard
					title="Потрачено"
					value={`${stats.totalSpent.toLocaleString()} ₽`}
					icon={<TrendingUp />}
				/>
				<StatCard
					title="Ваш рейтинг"
					value={stats.rating.toFixed(1)}
					icon={<Star className="text-yellow-400/80" />}
				/>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Последние бронирования */}
				<Card className="lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>История активности</CardTitle>
						<Link
							href="/dashboard/bookings"
							className="text-xs text-blue-400 hover:underline"
						>
							См. все
						</Link>
					</CardHeader>
					<CardContent>
						{bookings.length > 0 ? (
							<div className="space-y-4">
								{bookings.map((booking) => (
									<div
										key={booking.id}
										className="flex items-center justify-between rounded-lg border p-4"
									>
										<div className="flex items-center gap-4">
											<div className="rounded-lg bg-blue-100 p-2">
												<Package className="h-6 w-6 text-blue-600" />
											</div>
											<div>
												<h4 className="font-medium">
													{booking.equipment?.title}
												</h4>
												<div className="flex items-center gap-2 text-sm text-gray-500">
													<Clock className="h-3 w-3" />
													<span>
														{new Date(booking.startDate).toLocaleDateString(
															"ru-RU"
														)}{" "}
														-{" "}
														{new Date(booking.endDate).toLocaleDateString(
															"ru-RU"
														)}
													</span>
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-bold">
												{(booking.totalAmount || 0).toLocaleString("ru-RU")} ₽
											</div>
											<div
												className={`text-sm ${
													booking.status === "completed"
														? "text-green-600"
														: booking.status === "cancelled"
															? "text-red-600"
															: booking.status === "confirmed"
																? "text-blue-600"
																: "text-yellow-600"
												}`}
											>
												{booking.status === "completed"
													? "Завершено"
													: booking.status === "cancelled"
														? "Отменено"
														: booking.status === "confirmed"
															? "Подтверждено"
															: "Ожидание"}
											</div>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="py-8 text-center">
								<Package className="mx-auto h-12 w-12 text-gray-400" />
								<h3 className="mt-4 text-lg font-semibold">Бронирований нет</h3>
								<p className="mt-2">
									У вас еще нет бронирований. Найдите оборудование для аренды!
								</p>
								<Button asChild className="mt-4">
									<Link href="/equipment">Найти оборудование</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Быстрый доступ</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-2">
							<QuickActionLink
								href="/booking/new"
								icon={<Calendar size={20} />}
								label="Новая бронь"
								description="Выбрать технику"
							/>
							<QuickActionLink
								href="/dashboard/profile"
								icon={<User size={20} />}
								label="Профиль"
								description="Ваши данные и настройки"
							/>
							<QuickActionLink
								href="/equipment?favorites=true"
								icon={<Star size={20} />}
								label="Избранное"
								description="То, что понравилось"
							/>
							{/* Upcoming events */}
							<div className="mt-8">
								<h4 className="mb-4 font-semibold">Предстоящие события</h4>
								<div className="space-y-3">
									{bookings
										.filter((b) => {
											const endDate = new Date(b.endDate);
											const today = new Date();
											return endDate > today && b.status !== "cancelled";
										})
										.slice(0, 2)
										.map((booking) => (
											<div key={booking.id} className="rounded-lg border p-3">
												<div className="flex items-center justify-between">
													<div>
														<p className="font-medium">
															{booking.equipment?.title}
														</p>
														<p className="text-sm text-gray-600">
															Возврат:{" "}
															{new Date(booking.endDate).toLocaleDateString(
																"ru-RU"
															)}
														</p>
													</div>
													<Button size="sm" variant="outline" asChild>
														<Link href={`/dashboard/bookings/${booking.id}`}>
															Подробнее
														</Link>
													</Button>
												</div>
											</div>
										))}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

interface StatCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	description?: string;
}

function StatCard({ title, value, icon }: StatCardProps) {
	return (
		<Card className="relative overflow-hidden group">
			<div className="relative z-10">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-foreground/50 group-hover:text-foreground/80 transition-colors uppercase tracking-wider">
						{title}
					</CardTitle>
					<div className="text-foreground/30 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300">
						{icon}
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold text-foreground/80 tracking-tight drop-shadow-sm">
						{value}
					</div>
				</CardContent>
			</div>
		</Card>
	);
}
