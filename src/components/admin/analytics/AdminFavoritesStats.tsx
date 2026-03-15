import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

interface FavoritesStatRow {
	equipment_id: string;
	title: string;
	price_per_day: number;
	is_available: boolean;
	favorites_count: number;
	last_favorited_at: string | null;
}

export async function AdminFavoritesStats({ limit = 10 }: { limit?: number }) {
	const supabase = await createClient();

	// Use the favorites_stats VIEW from migration_admin_access_v3.sql
	const { data, error } = await supabase
		.from("favorites_stats")
		.select(
			"equipment_id, title, price_per_day, is_available, favorites_count, last_favorited_at"
		)
		.order("favorites_count", { ascending: false })
		.limit(limit);

	if (error) {
		// VIEW doesn't exist yet — fall back to a raw query
		console.warn(
			"[FavoritesStats] View not found, falling back:",
			error.message
		);
		return (
			<Card>
				<CardContent className="p-4 text-sm text-muted-foreground">
					Запустите migration_admin_access_v3.sql для активации статистики
					избранного
				</CardContent>
			</Card>
		);
	}

	const rows = (data ?? []) as FavoritesStatRow[];
	const totalFavorites = rows.reduce((s, r) => s + r.favorites_count, 0);

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-bold flex items-center gap-2">
						<Heart size={16} className="text-red-400" />
						Топ избранного
					</CardTitle>
					<Badge variant="outline" className="text-[10px]">
						{totalFavorites} всего
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				{rows.length === 0 ? (
					<p className="text-sm text-muted-foreground px-4 pb-4">
						Пока никто ничего не добавил в избранное
					</p>
				) : (
					<div className="divide-y divide-foreground/5">
						{rows.map((row, i) => (
							<div
								key={row.equipment_id}
								className="flex items-center gap-3 px-4 py-2.5"
							>
								{/* Rank */}
								<span className="w-5 text-xs text-muted-foreground font-mono shrink-0">
									{i + 1}
								</span>

								{/* Title + status */}
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium truncate">{row.title}</p>
									<p className="text-xs text-muted-foreground">
										{row.price_per_day.toLocaleString("ru-RU")} ₽/сутки
									</p>
								</div>

								{/* Availability */}
								{!row.is_available && (
									<Badge
										variant="outline"
										className="text-[10px] text-muted-foreground border-foreground/10 shrink-0"
									>
										Недоступно
									</Badge>
								)}

								{/* Favorites count */}
								<div className="flex items-center gap-1 shrink-0">
									<Heart size={12} className="text-red-400 fill-red-400" />
									<span className="text-sm font-bold tabular-nums">
										{row.favorites_count}
									</span>
								</div>

								{/* Bar */}
								<div className="w-16 h-1.5 rounded-full bg-foreground/8 overflow-hidden shrink-0">
									<div
										className="h-full bg-red-400 rounded-full"
										style={{
											width: `${Math.min(100, (row.favorites_count / (rows[0]?.favorites_count || 1)) * 100)}%`,
										}}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
