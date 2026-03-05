import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
	Boxes,
	Calendar,
	Heart,
	Layers,
	Package,
	Package2,
	PackageOpen,
	User,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingPreviewList } from "@/components/dashboard/bookings/BookingPreviewList";
import { VerificationBanner } from "@/components/forms/verification/VerificationBanner";
import { QuickActionLink } from "@/components/shared/QuickActionLink";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

// ─── Dashboard-specific narrow types ─────────────────────────────────────────
// These match exactly what the Supabase query returns — no casts needed.

export interface DashboardEquipment {
	title: string;
	// imageUrl comes from equipment_image_links → images
}

export interface DashboardBookingItem {
	equipment: DashboardEquipment;
	price_at_booking: number;
	/** First image URL extracted from equipment_image_links */
	imageUrl: string | null;
}

export interface DashboardBooking {
	id: string;
	start_date: string;
	end_date: string;
	total_amount: number;
	status: string;
	created_at: string;
	booking_items: DashboardBookingItem[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
	pending: "bg-amber-500/10 text-amber-500",
	confirmed: "bg-emerald-500/10 text-emerald-500",
	active: "bg-blue-500/10 text-blue-500",
	completed: "bg-foreground/5 text-muted-foreground",
	cancelled: "bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
	pending: "Ожидает",
	confirmed: "Подтверждён",
	active: "Активен",
	completed: "Завершён",
	cancelled: "Отменён",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
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

	const showBanner =
		application?.status === "no_application" || application?.status === "draft";

	const [
		{ data: bookingsRaw },
		{ count: totalBookings },
		{ count: activeBookings },
		{ count: completedBookings },
		{ count: cancelledBookings },
		{ data: spendingData },
	] = await Promise.all([
		supabase
			.from("bookings")
			.select(`
            id, start_date, end_date, total_amount, status, created_at,
            booking_items (
                price_at_booking,
                equipment ( title, equipment_image_links ( images ( url ) ) )
            )
        `)
			.eq("user_id", user.id)
			.order("created_at", { ascending: false })
			.limit(10),

		supabase
			.from("bookings")
			.select("id", { count: "exact", head: true })
			.eq("user_id", user.id),

		supabase
			.from("bookings")
			.select("id", { count: "exact", head: true })
			.eq("user_id", user.id)
			.in("status", ["pending", "confirmed", "active"]),

		supabase
			.from("bookings")
			.select("id", { count: "exact", head: true })
			.eq("user_id", user.id)
			.eq("status", "completed"),

		supabase
			.from("bookings")
			.select("id", { count: "exact", head: true })
			.eq("user_id", user.id)
			.eq("status", "cancelled"),

		supabase
			.from("bookings")
			.select("total_amount")
			.eq("user_id", user.id)
			.eq("status", "completed"),
	]);

	const totalSpent =
		(spendingData as Array<{ total_amount: number }> | null)?.reduce(
			(acc, item) => acc + (item.total_amount || 0),
			0
		) ?? 0;

	// ── Normalize raw Supabase data into our strict types ─────────────────────
	// Supabase returns deeply nested objects. We flatten imageUrl here
	// so components don't need to navigate the join tree.
	const bookings: DashboardBooking[] = (bookingsRaw ?? []).map((b) => ({
		id: b.id,
		start_date: b.start_date,
		end_date: b.end_date,
		total_amount: b.total_amount,
		status: b.status,
		created_at: b.created_at,
		booking_items: (
			b.booking_items as unknown as Array<{
				price_at_booking: number;
				equipment: {
					title: string;
					equipment_image_links: Array<{
						images: { url: string } | null;
					}> | null;
				} | null;
			}>
		).map((item) => ({
			price_at_booking: item.price_at_booking,
			equipment: {
				title: item.equipment?.title ?? "—",
			},
			imageUrl: item.equipment?.equipment_image_links?.[0]?.images?.url ?? null,
		})),
	}));

	const stats = {
		totalBookings: totalBookings ?? 0,
		activeBookings: activeBookings ?? 0,
		completedBookings: completedBookings ?? 0,
		cancelledBookings: cancelledBookings ?? 0,
		totalSpent,
	};

	const upcoming = bookings
		.filter(
			(b) => new Date(b.end_date) > new Date() && b.status !== "cancelled"
		)
		.slice(0, 2);

	return (
		<div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-8">
			{/* Greeting */}
			<div>
				<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground/90">
					Привет, {user.user_metadata?.name?.split(" ")[0] || "Пользователь"}!
				</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					Ваш кабинет управления арендой техники.
				</p>
			</div>

			{showBanner && <VerificationBanner />}

			{/* Stats */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard
					title="Всего заказов"
					value={stats.totalBookings}
					icon={<Boxes size={18} />}
				/>
				<StatCard
					title="Активных"
					value={stats.activeBookings}
					icon={<PackageOpen size={18} />}
				/>
				<StatCard
					title="Завершённых"
					value={stats.completedBookings}
					icon={<Package size={18} />}
				/>
				<StatCard
					title="Отменённых"
					value={stats.cancelledBookings}
					icon={<Package2 size={18} />}
				/>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<Card className="lg:col-span-2 overflow-hidden ">
					<CardHeader className="flex flex-row items-center justify-between pb-0 px-4 sm:px-6 pt-4 sm:pt-5">
						<CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
							Последние заказы
						</CardTitle>
						<Link
							href="/dashboard/bookings"
							className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
						>
							Все заказы →
						</Link>
					</CardHeader>
					<CardContent className="p-0 mt-1">
						<BookingPreviewList
							bookings={bookings}
							statusLabels={STATUS_LABELS}
							statusStyles={STATUS_STYLES}
						/>
					</CardContent>
				</Card>

				{/* ── Sidebar ── */}
				<div className="space-y-6">
					<Card className="bg-background">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
								Быстрый доступ
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-2">
							<QuickActionLink
								href="/booking/new"
								icon={<Calendar size={18} />}
								label="Новая бронь"
								description="Выбрать технику"
							/>
							<QuickActionLink
								href="/dashboard/profile"
								icon={<User size={18} />}
								label="Профиль"
								description="Данные и настройки"
							/>
							<QuickActionLink
								href="/favorites"
								icon={<Heart size={18} />}
								label="Избранное"
								description="Понравившаяся техника"
							/>
							<QuickActionLink
								href="/favorites"
								icon={<Layers size={18} />}
								label="Сеты"
								description="Любимые комплекты"
							/>

							{upcoming.length > 0 && (
								<div className="mt-4 pt-4 border-t border-border">
									<p className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-3">
										Предстоящие аренды
									</p>
									<div className="space-y-2">
										{upcoming.map((booking) => (
											<div
												key={booking.id}
												className="rounded-xl border border-border bg-card/40 p-3 hover:bg-muted/20 transition-colors"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="min-w-0">
														<p className="font-bold text-sm truncate">
															{booking.booking_items[0]?.equipment.title ??
																"Заказ"}
														</p>
														<p className="text-[11px] text-muted-foreground mt-0.5">
															до{" "}
															{format(
																new Date(booking.end_date),
																"d MMM, HH:mm",
																{ locale: ru }
															)}
														</p>
													</div>
													<Button
														size="sm"
														variant="ghost"
														className="rounded-lg h-7 w-7 p-0 shrink-0 text-primary"
														asChild
													>
														<Link
															href="/dashboard/bookings"
															aria-label="Открыть"
														>
															→
														</Link>
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
	title,
	value,
	icon,
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
}) {
	return (
		<Card className="relative overflow-hidden group">
			<CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
				<CardTitle className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground/80 transition-colors uppercase tracking-wider">
					{title}
				</CardTitle>
				<div className="text-foreground/25 group-hover:text-primary/60 transition-all duration-300">
					{icon}
				</div>
			</CardHeader>
			<CardContent className="pb-4 px-4">
				<div className="text-2xl sm:text-3xl font-bold text-foreground/80 tracking-tight">
					{value}
				</div>
			</CardContent>
		</Card>
	);
}
