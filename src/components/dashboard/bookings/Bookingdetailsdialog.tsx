"use client";

import { differenceInHours, format } from "date-fns";
import { ru } from "date-fns/locale";
import { Check, Copy, Info, X } from "lucide-react";
// import Link from "next/link";
import { useState } from "react";
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BookingRow } from "@/types";

// ─── Shared constants ─────────────────────────────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
	pending: "Ожидает",
	confirmed: "Одобрен",
	active: "Активен",
	completed: "Окончен",
	cancelled: "Отменён",
};

export const STATUS_STYLES: Record<string, string> = {
	pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
	confirmed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
	active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
	completed: "bg-foreground/5 text-muted-foreground border-foreground/10",
	cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function BookingDetailsDialog({ booking }: { booking: BookingRow }) {
	const [copied, setCopied] = useState(false);

	const hours = Math.ceil(
		differenceInHours(new Date(booking.end_date), new Date(booking.start_date))
	);

	const handleCopyEstimate = () => {
		const lines = [
			`Смета заказа #${booking.id.split("-")[0]?.toUpperCase()}`,
			`Период: ${format(new Date(booking.start_date), "d MMM yyyy HH:mm", { locale: ru })} — ${format(new Date(booking.end_date), "d MMM yyyy HH:mm", { locale: ru })}`,
			`Длительность: ${hours} ч.`,
			"",
			"Позиции:",
			...booking.booking_items.map(
				(item) =>
					`• ${item.equipment.title} — ${(item.price_at_booking || 0).toLocaleString()} ₽`
			),
			"",
			`Итого: ${booking.total_amount.toLocaleString()} ₽`,
			`Статус: ${STATUS_LABELS[booking.status] ?? booking.status}`,
		].join("\n");

		navigator.clipboard.writeText(lines).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-xl h-8 text-xs font-semibold hover:text-primary"
				>
					<Info size={14} />
				</Button>
			</DialogTrigger>
			<DialogContent
				showCloseButton={false}
				className={cn("p-0 gap-0 flex flex-col overflow-hidden border-border")}
			>
				{/* ── Header ── */}
				<DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border shrink-0">
					<div className="flex items-start justify-between gap-4 pr-8">
						<div>
							<DialogTitle className="text-xl text-left font-black uppercase tracking-tighter">
								№ {booking.id.split("-")[0]?.toUpperCase()}
							</DialogTitle>
							<div className="flex items-center mt-1.5 flex-wrap">
								<span className="text-[11px] text-muted-foreground">
									{format(new Date(booking.created_at), "d MMMM yyyy", {
										locale: ru,
									})}
								</span>
							</div>
						</div>

						<div className="flex-col">
							<div
								className={cn(
									"inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
									STATUS_STYLES[booking.status] ??
										"bg-foreground/5 text-muted-foreground border-foreground/10"
								)}
							>
								{STATUS_LABELS[booking.status] ?? booking.status}
							</div>
						</div>
					</div>
				</DialogHeader>

				{/* ── Scrollable body ── */}
				<div className="flex-1 min-h-0 overscroll-contain -mx-4 max-h-[95vh] overflow-y-auto">
					<div className="px-5 sm:px-6 py-5 space-y-5">
						{/* Period grid */}
						<div className="grid grid-cols-4 gap-2 p-4 rounded-xl bg-muted/20 border border-border">
							<div>
								<p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
									Начало
								</p>
								<p className="text-sm font-bold leading-snug">
									{format(new Date(booking.start_date), "d MMM", {
										locale: ru,
									})}
								</p>
								<p className="text-xs text-muted-foreground">
									{format(new Date(booking.start_date), "HH:mm")}
								</p>
							</div>
							<div>
								<p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
									Конец
								</p>
								<p className="text-sm font-bold leading-snug">
									{format(new Date(booking.end_date), "d MMM", {
										locale: ru,
									})}
								</p>
								<p className="text-xs text-muted-foreground">
									{format(new Date(booking.end_date), "HH:mm")}
								</p>
							</div>
							<div>
								<p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
									Время
								</p>
								<p className="text-sm font-bold">{hours} ч.</p>
							</div>
							<div>
								<p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
									Позиций
								</p>
								<p className="text-sm font-bold">
									{booking.booking_items.length} шт.
								</p>
							</div>
						</div>

						{/* Items table — scrollable if many */}
						<div>
							<div className="rounded-xl border border-border overflow-hidden">
								{/* Inner scroll for long lists */}
								<div className="max-h-70 overflow-y-auto overscroll-contain">
									<Table>
										<TableHeader>
											<TableRow className="hover:bg-transparent bg-muted/20 border-border">
												<TableHead className="text-[10px] font-bold uppercase py-2.5 text-muted-foreground">
													Позиция
												</TableHead>
												<TableHead className="text-[10px] font-bold uppercase py-2.5 text-muted-foreground text-right">
													Сумма
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{booking.booking_items.map((item) => (
												<TableRow
													key={item.id}
													className="border-border hover:bg-muted/10"
												>
													<TableCell className="py-3">
														<p className="font-semibold text-sm leading-snug">
															{item.equipment.title}
														</p>
														<p className="text-[11px] text-muted-foreground mt-0.5">
															{item.equipment.category}
														</p>
													</TableCell>
													<TableCell className="py-3 text-right font-mono font-bold text-sm tabular-nums whitespace-nowrap">
														{(item.price_at_booking || 0).toLocaleString()} ₽
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>

								{/* Total row — sticky outside scroll */}
								<div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
									<span className="text-xs font-bold uppercase text-muted-foreground">
										Итого
									</span>
									<span className="text-lg font-black tabular-nums">
										{booking.total_amount.toLocaleString()} ₽
									</span>
								</div>
							</div>
						</div>

						{/* Open full page link */}
						{/* <Link
							href={`/dashboard/bookings/${booking.id}`}
							className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
						>
							<ExternalLink size={12} />
							Открыть страницу заказа
						</Link> */}
					</div>
				</div>

				{/* ── Close button — pinned to bottom, easy thumb reach on mobile ── */}
				<DialogFooter className="flex w-full">
					<Button
						variant="outline"
						onClick={handleCopyEstimate}
						className="flex-1 rounded-xl h-12 font-semibold"
					>
						{copied ? (
							<>
								<Check size={14} className="text-emerald-500" />
								<span className="text-emerald-500">Скопировано</span>
							</>
						) : (
							<>
								<Copy size={14} />
								Скопировать
							</>
						)}
					</Button>
					<DialogClose asChild>
						<Button
							variant="outline"
							className="flex-1 rounded-xl h-12 font-semibold"
						>
							<X size={14} />
							Закрыть
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
