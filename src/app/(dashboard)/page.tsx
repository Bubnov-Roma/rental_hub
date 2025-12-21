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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
	// Создаем клиент Supabase с куками
	const supabase = await createClient();

	// Получаем текущего пользователя
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Если пользователь не авторизован, перенаправляем на страницу входа
	if (!user) {
		redirect("/login");
	}

	// Загружаем данные параллельно для лучшей производительности
	const [
		{ data: bookingsData },
		{ count: totalBookings },
		{ count: activeBookings },
		{ data: spendingData },
	] = await Promise.all([
		// Бронирования пользователя
		supabase
			.from("bookings")
			.select(`
				*,
				equipment:equipment(*)
			`)
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(5),

		// Общее количество бронирований
		supabase
			.from("bookings")
			.select("*", { count: "exact", head: true })
			.eq("user_id", user.id),

		// Активные бронирования
		supabase
			.from("bookings")
			.select("*", { count: "exact", head: true })
			.eq("user_id", user.id)
			.in("status", ["pending", "confirmed", "active"]),

		// Потраченные средства (только завершенные бронирования)
		supabase
			.from("bookings")
			.select("total_amount")
			.eq("user_id", user.id)
			.eq("status", "completed"),
	]);

	// Вычисляем общую сумму потраченных средств
	const totalSpent =
		spendingData?.reduce(
			(acc, item: { total_amount: number }) => acc + (item.total_amount || 0),
			0
		) || 0;

	// Подготавливаем данные для отображения
	const bookings = bookingsData || [];
	const stats = {
		totalBookings: totalBookings || 0,
		activeBookings: activeBookings || 0,
		totalSpent,
		rating: 4.5, // Статичное значение или можно вычислить из БД
	};

	return (
		<div className="space-y-6">
			{/* Greetings */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Добро пожаловать, {user.user_metadata?.name || "Пользователь"}!
					</h1>
					<p className="mt-2 text-gray-600">
						Вот что происходит с вашими бронированиями
					</p>
				</div>
				<Button asChild>
					<Link href="/equipment">
						Найти оборудование
						<ArrowRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Всего бронирований
						</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalBookings}</div>
						<p className="text-xs text-muted-foreground">
							+2 с прошлого месяца
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Активные</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.activeBookings}</div>
						<p className="text-xs text-muted-foreground">Текущие аренды</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Всего потрачено
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.totalSpent.toLocaleString("ru-RU")} ₽
						</div>
						<p className="text-xs text-muted-foreground">За все время</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Рейтинг</CardTitle>
						<Star className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.rating.toFixed(1)}</div>
						<p className="text-xs text-muted-foreground">
							Ваш рейтинг как арендатора
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Latest bookings */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Последние бронирования</CardTitle>
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
														{new Date(booking.start_date).toLocaleDateString(
															"ru-RU"
														)}{" "}
														-{" "}
														{new Date(booking.end_date).toLocaleDateString(
															"ru-RU"
														)}
													</span>
												</div>
											</div>
										</div>
										<div className="text-right">
											<div className="font-bold">
												{(booking.total_amount || 0).toLocaleString("ru-RU")} ₽
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
								<p className="mt-2 text-gray-600">
									У вас еще нет бронирований. Найдите оборудование для аренды!
								</p>
								<Button asChild className="mt-4">
									<Link href="/equipment">Найти оборудование</Link>
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Quick actions */}
				<Card>
					<CardHeader>
						<CardTitle>Быстрые действия</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Button
								variant="outline"
								className="w-full justify-start"
								asChild
							>
								<Link href="/booking/new">
									<Calendar className="mr-2 h-4 w-4" />
									Новое бронирование
								</Link>
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								asChild
							>
								<Link href="/dashboard/bookings">
									<Package className="mr-2 h-4 w-4" />
									Мои бронирования
								</Link>
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								asChild
							>
								<Link href="/dashboard/profile">
									<User className="mr-2 h-4 w-4" />
									Редактировать профиль
								</Link>
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								asChild
							>
								<Link href="/equipment?favorites=true">
									<Star className="mr-2 h-4 w-4" />
									Избранное оборудование
								</Link>
							</Button>
						</div>

						{/* Upcoming events */}
						<div className="mt-8">
							<h4 className="mb-4 font-semibold">Предстоящие события</h4>
							<div className="space-y-3">
								{bookings
									.filter((b) => {
										const endDate = new Date(b.end_date);
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
														{new Date(booking.end_date).toLocaleDateString(
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
	);
}
