"use client";

import { differenceInHours, format } from "date-fns";
import { ru } from "date-fns/locale";
import { Check, Copy, Info, Package, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { DashboardBooking } from "@/app/(dashboard)/dashboard/page";
import { ClientTime } from "@/components/shared";
import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
	bookings: DashboardBooking[];
	statusLabels: Record<string, string>;
	statusStyles: Record<string, string>;
}

// ─── BookingPreviewList ────────────────────────────────────────────────────────
export function BookingPreviewList({
	bookings,
	statusLabels,
	statusStyles,
}: Props) {
	if (bookings.length === 0) {
		return (
			<div className="py-12 text-center px-6">
				<Package className="mx-auto h-10 w-10 text-gray-400/30 mb-3" />
				<h3 className="text-sm font-semibold text-foreground/60">
					Бронирований нет
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Найдите оборудование для аренды
				</p>
				<Button asChild className="mt-4 rounded-xl" size="sm">
					<Link href="/equipment">Каталог</Link>
				</Button>
			</div>
		);
	}

	// Show first 5 directly, rest behind scroll (max-h + overflow-y-auto)
	const visible = bookings.slice(0, 10);

	return (
		<div className="max-h-130 overflow-y-auto overscroll-contain divide-y divide-border">
			{visible.map((booking) => (
				<BookingPreviewRow
					key={booking.id}
					booking={booking}
					statusLabels={statusLabels}
					statusStyles={statusStyles}
				/>
			))}
		</div>
	);
}

// ─── Single row ───────────────────────────────────────────────────────────────
function BookingPreviewRow({
	booking,
	statusLabels,
	statusStyles,
}: {
	booking: DashboardBooking;
	statusLabels: Record<string, string>;
	statusStyles: Record<string, string>;
}) {
	const firstItem = booking.booking_items[0];
	const extraCount = booking.booking_items.length - 1;

	const hours = Math.ceil(
		differenceInHours(new Date(booking.end_date), new Date(booking.start_date))
	);

	return (
		<div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-muted/10 transition-colors group">
			{/* Thumbnail */}
			<div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-muted-foreground/10 shrink-0">
				{firstItem?.imageUrl ? (
					<Image
						src={firstItem.imageUrl}
						alt={firstItem.equipment.title}
						fill
						sizes="56px"
						className="object-cover"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center">
						<Package size={18} className="text-muted-foreground/20" />
					</div>
				)}
				{/* Extra items badge */}
				{extraCount > 0 && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
						<span className="text-white text-[10px] font-black">
							+{extraCount}
						</span>
					</div>
				)}
			</div>

			{/* Info */}
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-0.5">
					<span className="font-mono text-[10px] font-bold text-muted-foreground/60">
						#{booking.id.split("-")[0]?.toUpperCase()}
					</span>
					<span
						className={cn(
							"inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
							statusStyles[booking.status] ??
								"bg-foreground/5 text-muted-foreground"
						)}
					>
						{statusLabels[booking.status] ?? booking.status}
					</span>
				</div>

				<p className="font-semibold text-sm leading-tight truncate">
					{firstItem?.equipment.title ?? "—"}
				</p>

				{/* Dates */}
				<div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
					{/* <span>
						{format(new Date(booking.start_date), "d MMM", { locale: ru })}
					</span> */}
					<ClientTime iso={booking.start_date} />
					<span className="opacity-40">→</span>
					{/* <span>
						{format(new Date(booking.end_date), "d MMM", { locale: ru })}
					</span> */}

					<ClientTime iso={booking.end_date} />
					{/* Desktop: show exact times */}
					<span className="hidden sm:inline opacity-40">·</span>
					<span className="hidden sm:inline">
						{format(new Date(booking.start_date), "HH:mm")}
						{" — "}
						{format(new Date(booking.end_date), "HH:mm")}
					</span>
					{/* Mobile: just hours */}
					<span className="sm:hidden opacity-40">·</span>
					<span className="sm:hidden">{hours} ч.</span>
				</div>
			</div>

			{/* Details button */}
			<BookingDetailDialog
				booking={booking}
				statusLabels={statusLabels}
				statusStyles={statusStyles}
				hours={hours}
			/>
		</div>
	);
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────
function BookingDetailDialog({
	booking,
	statusLabels,
	statusStyles,
	hours,
}: {
	booking: DashboardBooking;
	statusLabels: Record<string, string>;
	statusStyles: Record<string, string>;
	hours: number;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		const lines = [
			`Смета заказа № ${booking.id.split("-")[0]?.toUpperCase()}`,
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
			`Статус: ${statusLabels[booking.status] ?? booking.status}`,
		].join("\n");

		navigator.clipboard.writeText(lines).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<Dialog>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="rounded-xl h-8 text-xs font-semibold hover:text-primary"
						>
							<Info size={14} />
						</Button>
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent side="left">Открыть детали</TooltipContent>
			</Tooltip>
			<DialogContent
				showCloseButton={false}
				className={cn("p-0 gap-0 flex flex-col overflow-hidden")}
			>
				{/* ── Header ── */}
				<DialogHeader className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 shrink-0 bg-muted-foreground/10">
					<div className="min-w-0">
						<DialogTitle className="text-lg sm:text-xl font-black uppercase italic tracking-tighter leading-tight">
							Смета № {booking.id.split("-")[0]?.toUpperCase()}
						</DialogTitle>
						<div className="flex items-center gap-2 mt-1.5 flex-wrap">
							<span
								className={cn(
									"inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
									statusStyles[booking.status] ??
										"bg-foreground/5 text-muted-foreground"
								)}
							>
								{statusLabels[booking.status] ?? booking.status}
							</span>
							<span className="text-[11px] text-muted-foreground">
								{format(new Date(booking.created_at), "d MMMM yyyy", {
									locale: ru,
								})}
							</span>
						</div>
					</div>
				</DialogHeader>

				{/* ── Scrollable body ── */}
				<div className="flex-1 min-h-0 overscroll-contain -mx-4 max-h-[95vh] overflow-y-auto">
					<div className="px-5 sm:px-6 py-5 bg-muted-foreground/10">
						{/* Items table — scrollable if many */}
						<div className="rounded-xl border border-muted-foreground/20 overflow-hidden bg-background">
							{/* Inner scroll for long lists */}
							<div className="max-h-100 overflow-y-auto overscroll-contain">
								<div>
									<div className="space-y-2">
										{booking.booking_items.map((item, idx) => (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: no unique id in this shape
												key={idx}
												className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted-foreground/20 transition-colors"
											>
												{/* Item thumbnail */}
												<div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted-foreground/30 shrink-0">
													{item.imageUrl ? (
														<Image
															src={item.imageUrl}
															alt={item.equipment.title}
															fill
															sizes="48px"
															className="object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center">
															<Package
																size={14}
																className="text-muted-foreground/30"
															/>
														</div>
													)}
												</div>

												{/* Item info */}
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-sm leading-snug truncate">
														{item.equipment.title}
													</p>
													<p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
														{(item.price_at_booking || 0).toLocaleString()} ₽
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Total grid row */}
							<div className="grid grid-cols-5 gap-2 p-4 rounded-xl bg-muted/20 border border-border">
								<div>
									<p className="text-[9px] uppercase text-muted-foreground font-bold mb-1">
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
									<p className="text-[9px] uppercase text-muted-foreground font-bold mb-1">
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
									<p className="text-[9px] uppercase text-muted-foreground font-bold mb-1">
										Время
									</p>
									<p className="text-sm font-bold">{hours} ч.</p>
								</div>
								<div>
									<p className="text-[9px] uppercase text-muted-foreground font-bold mb-1">
										Позиций
									</p>
									<p className="text-sm font-bold">
										{/* {formatPlural(booking.booking_items.length, "items")} */}
										{booking.booking_items.length} шт.
									</p>
								</div>
								<div className="flex flex-col justify-between items-end h-full ">
									{/* items-end вместо text-right для выравнивания flex-элементов вправо */}
									<p className="text-[9px] uppercase opacity-50 font-bold">
										Итого
									</p>
									<p className="text-sm font-black italic">
										{booking.total_amount.toLocaleString()} ₽
									</p>
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

				<DialogFooter className="flex w-full p-2 bg-muted-foreground/10">
					<Button
						onClick={handleCopy}
						variant="outline"
						className="flex-1 shrink-0 rounded-xl h-12 font-semibold px-3 text-xs gap-1.5 transition-all"
					>
						{copied ? (
							<>
								<Check size={14} className="text-emerald-500" />
								<span className="text-emerald-500">OK</span>
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
