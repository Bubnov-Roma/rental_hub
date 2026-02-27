"use client";

import {
	differenceInHours,
	format,
	isWithinInterval,
	parseISO,
} from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarSearch, Package, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BookingRow } from "@/types";
import {
	BookingDetailsDialog,
	STATUS_LABELS,
	STATUS_STYLES,
} from "./Bookingdetailsdialog";

// ─── Filter state ─────────────────────────────────────────────────────────────
interface Filters {
	search: string; // matches order ID or equipment title
	status: string; // "" = all
	dateFrom: string;
	dateTo: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function BookingsTable({ bookings }: { bookings: BookingRow[] }) {
	const [filters, setFilters] = useState<Filters>({
		search: "",
		status: "",
		dateFrom: "",
		dateTo: "",
	});

	const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
		setFilters((prev) => ({ ...prev, [key]: value }));

	const clearFilters = () =>
		setFilters({ search: "", status: "", dateFrom: "", dateTo: "" });

	const hasActiveFilters =
		filters.search || filters.status || filters.dateFrom || filters.dateTo;

	// ── Filtered bookings ──────────────────────────────────────────────────────
	const filtered = useMemo(() => {
		return bookings.filter((b) => {
			// Search: order ID prefix or any item title
			if (filters.search) {
				const q = filters.search.toLowerCase();
				const idMatch = b.id.split("-")[0]?.toLowerCase().includes(q);
				const titleMatch = b.booking_items.some((item) =>
					item.equipment.title.toLowerCase().includes(q)
				);
				if (!idMatch && !titleMatch) return false;
			}

			// Status filter
			if (filters.status && b.status !== filters.status) return false;

			// Date range: booking start_date must fall within the selected range
			if (filters.dateFrom || filters.dateTo) {
				const start = parseISO(b.start_date);
				const from = filters.dateFrom
					? parseISO(filters.dateFrom)
					: new Date(0);
				const to = filters.dateTo
					? parseISO(`${filters.dateTo}T23:59:59`)
					: new Date(8.64e15);
				if (!isWithinInterval(start, { start: from, end: to })) return false;
			}

			return true;
		});
	}, [bookings, filters]);

	const allStatuses = Array.from(new Set(bookings.map((b) => b.status)));

	return (
		<div className="space-y-4">
			{/* ── Search & filter bar ── */}
			<div className="flex flex-col sm:flex-row gap-2">
				{/* Search */}
				<div className="relative flex-1">
					<Search
						size={14}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						type="text"
						placeholder="Поиск по № заказа или названию..."
						value={filters.search}
						onChange={(e) => setFilter("search", e.target.value)}
						className={cn(
							"w-full h-9 pl-9 pr-3 rounded-xl text-sm",
							"bg-muted/30 border border-border",
							"placeholder:text-muted-foreground/50",
							"focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40",
							"transition-all"
						)}
					/>
				</div>

				{/* Status select */}
				<select
					value={filters.status}
					onChange={(e) => setFilter("status", e.target.value)}
					className={cn(
						"h-9 px-3 rounded-xl text-sm font-medium",
						"bg-muted/30 border border-border",
						"focus:outline-none focus:ring-2 focus:ring-primary/30",
						"text-foreground cursor-pointer min-w-32",
						!filters.status && "text-muted-foreground"
					)}
				>
					<option value="">Все статусы</option>
					{allStatuses.map((s) => (
						<option key={s} value={s}>
							{STATUS_LABELS[s] ?? s}
						</option>
					))}
				</select>

				{/* Date from */}
				<div className="relative">
					<CalendarSearch
						size={13}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
					/>
					<input
						type="date"
						value={filters.dateFrom}
						onChange={(e) => setFilter("dateFrom", e.target.value)}
						className={cn(
							"h-9 pl-8 pr-3 rounded-xl text-sm",
							"bg-muted/30 border border-border",
							"focus:outline-none focus:ring-2 focus:ring-primary/30",
							"text-foreground cursor-pointer"
						)}
					/>
				</div>

				{/* Date to */}
				<div className="relative">
					<CalendarSearch
						size={13}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
					/>
					<input
						type="date"
						value={filters.dateTo}
						onChange={(e) => setFilter("dateTo", e.target.value)}
						className={cn(
							"h-9 pl-8 pr-3 rounded-xl text-sm",
							"bg-muted/30 border border-border",
							"focus:outline-none focus:ring-2 focus:ring-primary/30",
							"text-foreground cursor-pointer"
						)}
					/>
				</div>

				{/* Clear */}
				{hasActiveFilters && (
					<button
						type="button"
						onClick={clearFilters}
						className="h-9 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border transition-colors flex items-center gap-1.5 whitespace-nowrap"
					>
						<X size={12} />
						Сбросить
					</button>
				)}
			</div>

			{/* ── Active filter chips ── */}
			{hasActiveFilters && (
				<div className="flex flex-wrap gap-1.5 text-xs">
					{filters.search && (
						<span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20 flex items-center gap-1.5">
							«{filters.search}»
							<button type="button" onClick={() => setFilter("search", "")}>
								<X size={10} />
							</button>
						</span>
					)}
					{filters.status && (
						<span className="px-2.5 py-1 rounded-full bg-muted/40 text-foreground font-medium border border-border flex items-center gap-1.5">
							{STATUS_LABELS[filters.status] ?? filters.status}
							<button type="button" onClick={() => setFilter("status", "")}>
								<X size={10} />
							</button>
						</span>
					)}
					{(filters.dateFrom || filters.dateTo) && (
						<span className="px-2.5 py-1 rounded-full bg-muted/40 text-foreground font-medium border border-border flex items-center gap-1.5">
							{filters.dateFrom || "…"} — {filters.dateTo || "…"}
							<button
								type="button"
								onClick={() => {
									setFilter("dateFrom", "");
									setFilter("dateTo", "");
								}}
							>
								<X size={10} />
							</button>
						</span>
					)}
					<span className="px-2.5 py-1 text-muted-foreground">
						{filtered.length} из {bookings.length}
					</span>
				</div>
			)}

			{/* ── Table ── */}
			<div className="rounded-xl border border-border overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent border-border bg-muted/30">
							<TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-2">
								Заказ
							</TableHead>
							<TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-2 hidden sm:table-cell">
								Период
							</TableHead>
							<TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-2 hidden md:table-cell">
								Позиции
							</TableHead>
							<TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-2">
								Статус
							</TableHead>
							<TableHead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground py-2 text-right">
								Сумма
							</TableHead>
							<TableHead className="py-3 w-24" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{filtered.map((booking) => {
							const hours = Math.ceil(
								differenceInHours(
									new Date(booking.end_date),
									new Date(booking.start_date)
								)
							);
							return (
								<TableRow
									key={booking.id}
									className="border-border hover:bg-muted/20 transition-colors"
								>
									{/* Order ID */}
									<TableCell className="py-4">
										<div className="font-mono text-sm font-bold">
											#{booking.id.split("-")[0]?.toUpperCase()}
										</div>
										<div className="text-[11px] text-muted-foreground mt-0.5">
											{format(new Date(booking.created_at), "d MMM yyyy", {
												locale: ru,
											})}
										</div>
									</TableCell>

									{/* Dates */}
									<TableCell className="py-4 hidden sm:table-cell">
										<div className="text-sm font-medium">
											{format(new Date(booking.start_date), "d MMM", {
												locale: ru,
											})}
											{" — "}
											{format(new Date(booking.end_date), "d MMM", {
												locale: ru,
											})}
										</div>
										<div className="text-[11px] text-muted-foreground mt-0.5">
											{hours} ч.
										</div>
									</TableCell>

									{/* Items */}
									<TableCell className="py-4 hidden md:table-cell">
										<div className="text-sm">
											{booking.booking_items.length} поз.
										</div>
										<div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-40">
											{booking.booking_items[0]?.equipment.title}
											{booking.booking_items.length > 1 &&
												` +${booking.booking_items.length - 1}`}
										</div>
									</TableCell>

									{/* Status */}
									<TableCell className="py-4">
										<span
											className={cn(
												"inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
												STATUS_STYLES[booking.status] ??
													"bg-foreground/5 text-muted-foreground border-foreground/10"
											)}
										>
											{STATUS_LABELS[booking.status] ?? booking.status}
										</span>
									</TableCell>

									{/* Amount */}
									<TableCell className="py-4 text-right">
										<div className="font-black text-sm tabular-nums">
											{booking.total_amount.toLocaleString()} ₽
										</div>
									</TableCell>

									{/* Details */}
									<TableCell className="py-4 text-right">
										<Tooltip>
											<TooltipTrigger asChild>
												<BookingDetailsDialog booking={booking} />
											</TooltipTrigger>
											<TooltipContent>Детали заказа</TooltipContent>
										</Tooltip>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>

				{filtered.length === 0 && (
					<div className="py-16 text-center text-muted-foreground">
						<Package size={28} className="mx-auto mb-3 opacity-20" />
						{hasActiveFilters ? (
							<>
								<p className="text-sm font-medium">Ничего не найдено</p>
								<button
									type="button"
									onClick={clearFilters}
									className="mt-2 text-primary text-sm hover:underline"
								>
									Сбросить фильтры
								</button>
							</>
						) : (
							<>
								<p className="text-sm font-medium">Заказов пока нет</p>
								<Link
									href="/equipment"
									className="text-primary text-sm hover:underline mt-2 inline-block"
								>
									Перейти в каталог
								</Link>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
