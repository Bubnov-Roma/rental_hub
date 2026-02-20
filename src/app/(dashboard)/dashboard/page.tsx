import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
	ArrowRight,
	Calendar,
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
import { cn } from "@/lib/utils";

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

	const [
		{ data: bookingsData },
		{ count: totalBookings },
		{ count: activeBookings },
		{ data: spendingData },
	] = await Promise.all([
		supabase
			.from("bookings")
			.select(`
				*,
				booking_items (
      equipment (title, imageUrl)
    )
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
				<Button asChild className="cursor-pointer mr-8">
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
							// Замени блок в Card истории на этот:
							<div className="space-y-2">
								{bookings.map((booking) => (
									<div
										key={booking.id}
										className="group flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
									>
										<div className="flex items-center gap-4">
											{/* Аватар первого предмета в заказе */}
											<div className="w-12 h-12 rounded-xl overflow-hidden bg-muted relative shrink-0 border border-white/10">
												{/* Здесь можно добавить Image если в запросе есть imageUrl */}
												<div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary">
													<Package size={20} />
												</div>
											</div>

											<div>
												<h4 className="font-bold text-sm leading-tight">
													{booking.booking_items[0]?.equipment.title}
													{booking.booking_items.length > 1 && (
														<span className="text-primary ml-1">
															+{booking.booking_items.length - 1}
														</span>
													)}
												</h4>
												<p className="text-[10px] text-muted-foreground uppercase mt-1">
													{format(new Date(booking.start_date), "d MMMM", {
														locale: ru,
													})}
												</p>
											</div>
										</div>

										<div className="text-right">
											<div className="font-black text-sm">
												{booking.total_amount.toLocaleString()} ₽
											</div>
											<div
												className={cn(
													"text-[9px] uppercase font-bold tracking-widest",
													booking.status === "pending"
														? "text-yellow-500"
														: "text-primary"
												)}
											>
												{booking.status}
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
								<h4 className="mb-4 font-semibold text-sm opacity-70">
									Предстоящие аренды
								</h4>
								<div className="space-y-3">
									{bookings
										.filter((b) => {
											const endDate = new Date(b.end_date); // исправлено
											return endDate > new Date() && b.status !== "cancelled";
										})
										.slice(0, 2)
										.map((booking) => (
											<div
												key={booking.id}
												className="rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
											>
												<div className="flex items-center justify-between gap-4">
													<div className="min-w-0">
														<p className="font-bold text-sm truncate uppercase tracking-tighter">
															{booking.booking_items?.[0]?.equipment?.title ||
																"Заказ"}
														</p>
														<p className="text-[10px] text-muted-foreground mt-1">
															Возврат:{" "}
															{format(
																new Date(booking.end_date),
																"d MMM HH:mm",
																{ locale: ru }
															)}
														</p>
													</div>
													<Button
														size="sm"
														variant="outline"
														className="rounded-xl shrink-0"
														asChild
													>
														<Link href={`/dashboard/bookings/${booking.id}`}>
															Инфо
														</Link>
													</Button>
												</div>
											</div>
										))}
								</div>
							</div>
							{/* <div className="mt-8">
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
							</div> */}
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
