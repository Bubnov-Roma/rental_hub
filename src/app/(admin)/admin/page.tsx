import {
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	MessageSquare,
	Package,
	Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats } from "@/core/infrastructure/admin/stats-repository";
import { getStatusColor, getStatusText } from "@/utils";

export default async function AdminDashboardPage() {
	const stats = await getAdminStats();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">
					Панель администратора
				</h1>
				<p className="mt-2 text-gray-600">
					Обзор статистики и управление платформой
				</p>
			</div>

			{/* Statistic */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Всего пользователей
						</CardTitle>
						<Users className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalUsers}</div>
						<p className="text-xs text-gray-500">
							<span className="text-green-600">+12.5%</span> за месяц
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Оборудование</CardTitle>
						<Package className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalEquipment}</div>
						<p className="text-xs text-gray-500">
							<span className="text-green-600">+5</span> новых единиц
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Бронирования</CardTitle>
						<Calendar className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalBookings}</div>
						<p className="text-xs text-gray-500">
							<span className="text-green-600">+18%</span> за месяц
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Общая выручка</CardTitle>
						<DollarSign className="h-4 w-4 text-amber-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.totalRevenue.toLocaleString("ru-RU")} ₽
						</div>
						<p className="text-xs text-gray-500">
							{stats.monthlyRevenue.toLocaleString("ru-RU")} ₽ за месяц
						</p>
					</CardContent>
				</Card>
			</div>
			{/* Graphs & Tables */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-2">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Последние бронирования</CardTitle>
							<Button variant="outline" size="sm">
								<Link href="/admin/bookings">Смотреть все</Link>
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
											Пользователь
										</th>
										<th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
											Оборудование
										</th>
										<th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
											Сумма
										</th>
										<th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
											Статус
										</th>
										<th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
											Дата
										</th>
									</tr>
								</thead>
								<tbody className="divide-y">
									{stats.recentBookings.map((booking) => (
										<tr key={booking.id} className="hover:bg-gray-50">
											<td className="px-4 py-3">
												<div className="flex items-center gap-3">
													<div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500"></div>
													<div>
														<p className="font-medium">
															{booking.user?.name || "Аноним"}
														</p>
														<p className="text-xs text-gray-500">
															{booking.user?.email}
														</p>
													</div>
												</div>
											</td>
											<td className="px-4 py-3">
												<p className="font-medium">
													{booking.equipment?.title}
												</p>
											</td>
											<td className="px-4 py-3 font-medium">
												{booking.total_amount.toLocaleString("ru-RU")} ₽
											</td>
											<td className="px-4 py-3">
												<Badge className={getStatusColor(booking.status)}>
													{getStatusText(booking.status)}
												</Badge>
											</td>
											<td className="px-4 py-3 text-sm text-gray-500">
												{new Date(booking.created_at).toLocaleDateString(
													"ru-RU"
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
				{/* Quick actions */}
				<Card>
					<CardHeader>
						<CardTitle>Быстрые действия</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Button className="w-full justify-start" asChild>
								<Link href="/admin/equipment/new">
									<Package className="mr-2 h-4 w-4" />
									Добавить оборудование
								</Link>
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								asChild
							>
								<Link href="/admin/users">
									<Users className="mr-2 h-4 w-4" />
									Управление пользователями
								</Link>
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								asChild
							>
								<Link href="/admin/bookings">
									<Calendar className="mr-2 h-4 w-4" />
									Все бронирования
								</Link>
							</Button>
							<Button
								variant="outline"
								className="w-full justify-start"
								asChild
							>
								<Link href="/admin/reviews">
									<MessageSquare className="mr-2 h-4 w-4" />
									Модерация отзывов
								</Link>
							</Button>
						</div>
						{/* System status */}
						<div className="mt-8 space-y-4">
							<h4 className="font-semibold">Статус системы</h4>
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm">База данных</span>
									</div>
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700"
									>
										Активно
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm">Файловое хранилище</span>
									</div>
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700"
									>
										Активно
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm">Аутентификация</span>
									</div>
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700"
									>
										Активно
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-amber-600" />
										<span className="text-sm">Обновление данных</span>
									</div>
									<Badge
										variant="outline"
										className="bg-amber-50 text-amber-700"
									>
										15 мин
									</Badge>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
