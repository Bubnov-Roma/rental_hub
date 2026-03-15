import {
	Calendar,
	CheckCircle,
	Clock,
	FolderOpen,
	HelpCircle,
	Package,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES } from "@/constants";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types";

// const STATUS_LABELS: Record<string, string> = {
// 	pending_review: "Ожидает проверки",
// 	wait_payment: "Ждёт оплаты",
// 	ready_to_rent: "Готов к выдаче",
// 	active: "В аренде",
// 	completed: "Завершён",
// 	cancelled: "Отменён",
// };

// const STATUS_COLORS: Record<string, string> = {
// 	pending_review: "bg-amber-500/15 text-amber-400 border-amber-500/20",
// 	wait_payment: "bg-blue-500/15 text-blue-400 border-blue-500/20",
// 	ready_to_rent: "bg-green-500/15 text-green-400 border-green-500/20",
// 	active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
// 	completed: "bg-foreground/10 text-foreground/60 border-foreground/10",
// 	cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
// };

interface RecentBookingRaw {
	id: string;
	status: string;
	total_amount: number;
	created_at: string;
	profiles: { name: string | null; email: string | null }[] | null;
	booking_items:
		| { equipment: { title: string }[] | { title: string } | null }[]
		| null;
}

async function getAdminDashboardData() {
	const supabase = await createClient();

	const [
		{ count: totalUsers },
		{ count: totalEquipment },
		{ count: totalBookings },
		{ count: pendingBookings },
		{ data: recentBookings },
		{ data: categories },
		{ count: faqCount },
	] = await Promise.all([
		supabase.from("profiles").select("id", { count: "exact", head: true }),
		supabase.from("equipment").select("id", { count: "exact", head: true }),
		supabase.from("bookings").select("id", { count: "exact", head: true }),
		supabase
			.from("bookings")
			.select("id", { count: "exact", head: true })
			.eq("status", "pending_review"),
		supabase
			.from("bookings")
			.select(
				`id, status, total_amount, created_at,
         profiles!bookings_user_id_fkey(name, email),
         booking_items(equipment:equipment_id(title))`
			)
			.order("created_at", { ascending: false })
			.limit(6),
		supabase
			.from("categories")
			.select("id, name, slug")
			.order("sort_order")
			.limit(8),
		supabase.from("faq_items").select("id", { count: "exact", head: true }),
	]);

	const { data: revenueData } = await supabase
		.from("bookings")
		.select("total_amount, created_at")
		.not("status", "eq", "cancelled");

	const totalRevenue =
		revenueData?.reduce((s, b) => s + (b.total_amount || 0), 0) ?? 0;

	const thisMonth = new Date();
	thisMonth.setDate(1);
	thisMonth.setHours(0, 0, 0, 0);
	const monthlyRevenue =
		revenueData
			?.filter((b) => new Date(b.created_at) >= thisMonth)
			.reduce((s, b) => s + (b.total_amount || 0), 0) ?? 0;

	return {
		totalUsers: totalUsers ?? 0,
		totalEquipment: totalEquipment ?? 0,
		totalBookings: totalBookings ?? 0,
		pendingBookings: pendingBookings ?? 0,
		totalRevenue,
		monthlyRevenue,
		recentBookings: (recentBookings ?? []) as RecentBookingRaw[],
		categories: categories ?? [],
		faqCount: faqCount ?? 0,
	};
}

function QuickAction({
	href,
	icon: Icon,
	label,
	description,
	badge,
}: {
	href: string;
	icon: React.ElementType;
	label: string;
	description?: string;
	badge?: number;
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-3 p-3 rounded-xl border border-foreground/5 bg-foreground/3 hover:bg-foreground/6 hover:border-primary/20 transition-all group"
		>
			<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
				<Icon size={16} className="text-primary" />
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold truncate">{label}</p>
				{description && (
					<p className="text-xs text-muted-foreground truncate">
						{description}
					</p>
				)}
			</div>
			{badge !== undefined && badge > 0 && (
				<span className="shrink-0 min-w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center px-1.5">
					{badge}
				</span>
			)}
		</Link>
	);
}

function extractEquipmentTitle(
	bookingItems: RecentBookingRaw["booking_items"]
): string {
	if (!bookingItems || bookingItems.length === 0) return "—";
	const first = bookingItems[0];
	if (!first?.equipment) return "—";
	if (Array.isArray(first?.equipment)) {
		return first?.equipment[0]?.title ?? "—";
	}
	return (first?.equipment as { title: string }).title ?? "—";
}

export default async function AdminDashboardPage() {
	const stats = await getAdminDashboardData();

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-black italic uppercase tracking-tight">
					Панель администратора
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{new Date().toLocaleDateString("ru-RU", {
						weekday: "long",
						day: "numeric",
						month: "long",
					})}
				</p>
			</div>

			{/* KPI grid */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{
						label: "Пользователи",
						value: stats.totalUsers,
						icon: Users,
						color: "text-blue-400",
					},
					{
						label: "Оборудование",
						value: stats.totalEquipment,
						icon: Package,
						color: "text-purple-400",
					},
					{
						label: "Бронирования",
						value: stats.totalBookings,
						icon: Calendar,
						color: "text-green-400",
						badge:
							stats.pendingBookings > 0 ? stats.pendingBookings : undefined,
					},
					{
						label: "Выручка / месяц",
						value: `${stats.monthlyRevenue.toLocaleString("ru-RU")} ₽`,
						icon: TrendingUp,
						color: "text-amber-400",
						sub: `${stats.totalRevenue.toLocaleString("ru-RU")} ₽ всего`,
					},
				].map((stat) => (
					<Card key={stat.label} className="relative overflow-hidden">
						<CardContent className="p-5">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
										{stat.label}
									</p>
									<p className="text-2xl font-black mt-1">{stat.value}</p>
									{"sub" in stat && stat.sub && (
										<p className="text-xs text-muted-foreground mt-0.5">
											{stat.sub}
										</p>
									)}
								</div>
								<stat.icon size={20} className={stat.color} />
							</div>
							{"badge" in stat && stat.badge !== undefined && (
								<div className="mt-2">
									<span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
										<Clock size={10} />
										{stat.badge} ожидает
									</span>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Recent bookings */}
				<Card className="lg:col-span-2">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-base font-bold">
								Последние бронирования
							</CardTitle>
							<Button variant="outline" size="sm" asChild>
								<Link href="/admin/bookings">Все →</Link>
							</Button>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b border-foreground/5">
										{["Клиент", "Техника", "Сумма", "Статус"].map((h) => (
											<th
												key={h}
												className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
											>
												{h}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{stats.recentBookings.map((booking) => {
										const profile = Array.isArray(booking.profiles)
											? booking.profiles[0]
											: booking.profiles;
										const equipmentTitle = extractEquipmentTitle(
											booking.booking_items
										);
										const statusLabel =
											BOOKING_STATUS_LABELS[
												booking.status as unknown as BookingStatus
											] ?? booking.status;
										const statusColor =
											BOOKING_STATUS_STYLES[
												booking.status as unknown as BookingStatus
											] ?? "bg-foreground/10 text-foreground/60";
										return (
											<tr
												key={booking.id}
												className="border-b border-foreground/5 last:border-0 hover:bg-foreground/3 transition-colors"
											>
												<td className="px-4 py-3">
													<p className="text-sm font-medium truncate max-w-32">
														{profile?.name || "Без имени"}
													</p>
													<p className="text-[11px] text-muted-foreground truncate max-w-32">
														{profile?.email || "—"}
													</p>
												</td>
												<td className="px-4 py-3">
													<p className="text-sm truncate max-w-36 text-muted-foreground">
														{equipmentTitle}
													</p>
												</td>
												<td className="px-4 py-3 font-bold text-sm whitespace-nowrap">
													{booking.total_amount.toLocaleString("ru-RU")} ₽
												</td>
												<td className="px-4 py-3">
													<Badge
														variant="outline"
														className={`text-[10px] ${statusColor}`}
													>
														{statusLabel}
													</Badge>
												</td>
											</tr>
										);
									})}
									{stats.recentBookings.length === 0 && (
										<tr>
											<td
												colSpan={4}
												className="px-4 py-8 text-center text-sm text-muted-foreground"
											>
												Бронирований пока нет
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* Right column */}
				<div className="space-y-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base font-bold">
								Быстрые действия
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<QuickAction
								href="/admin/equipment"
								icon={Package}
								label="Оборудование"
								description="Управление каталогом"
							/>
							<QuickAction
								href="/admin/categories"
								icon={FolderOpen}
								label="Категории"
								description={`${stats.categories.length} категорий`}
							/>
							<QuickAction
								href="/admin/users"
								icon={Users}
								label="Пользователи"
								description={`${stats.totalUsers} аккаунтов`}
							/>
							<QuickAction
								href="/admin/bookings"
								icon={Calendar}
								label="Бронирования"
								badge={stats.pendingBookings}
								description="Обработка заявок"
							/>
							<QuickAction
								href="/admin/faq"
								icon={HelpCircle}
								label="FAQ"
								description={`${stats.faqCount} вопросов`}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base font-bold">
								Статус системы
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							{["База данных", "Файловое хранилище", "Аутентификация"].map(
								(label) => (
									<div
										key={label}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-2">
											<CheckCircle size={14} className="text-green-500" />
											<span className="text-sm">{label}</span>
										</div>
										<Badge
											variant="outline"
											className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]"
										>
											Работает
										</Badge>
									</div>
								)
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
