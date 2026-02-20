import { differenceInHours, format } from "date-fns";
import { ru } from "date-fns/locale";
import {
	ArrowRight,
	Calendar as CalendarIcon,
	ExternalLink,
	FileText,
	Package,
} from "lucide-react";
import Link from "next/link";
import {
	Button,
	Card,
	Dialog,
	DialogContent,
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
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types";

export default async function BookingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data: bookings } = await supabase
		.from("bookings")
		.select(`
      *,
      booking_items (
			  id,
			  price_at_booking,
        equipment (title, category, price_4h, price_8h, price_per_day)
      )
    `)
		.eq("user_id", user?.id)
		.order("created_at", { ascending: false });

	return (
		<div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10">
			<div className="space-y-2">
				<h1 className="text-4xl font-black uppercase italic tracking-tighter">
					Мои заказы
				</h1>
				<p className="text-muted-foreground">
					История и текущие статусы вашей аренды
				</p>
			</div>

			<div className="grid gap-6">
				{bookings?.map((booking, idx) => {
					const hours = Math.ceil(
						differenceInHours(
							new Date(booking.end_date),
							new Date(booking.start_date)
						)
					);
					return (
						<Card
							key={booking.id || idx}
							className="glass-container p-1 rounded-[2rem] border-white/15 overflow-hidden transition-all hover:border-primary/30 group"
						>
							<div className="p-6 sm:p-8 bg-background/40 rounded-[1.9rem] flex flex-col md:flex-row gap-8 justify-between">
								{/* Левая часть: Инфо о составе */}
								<div className="space-y-4 flex-1 min-w-0">
									<div className="flex items-center gap-3">
										<Package size={14} className="text-primary" />
										<span
											className={cn(
												"text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
												booking.status === "pending"
													? "bg-yellow-500/20 text-yellow-500"
													: booking.status === "confirmed"
														? "bg-primary/20 text-primary"
														: "bg-white/10 text-muted-foreground"
											)}
										>
											{booking.status}
										</span>
										<span className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">
											ID-{booking.id.split("-")[0]}
										</span>
									</div>

									<div className="space-y-2">
										<h3 className="text-xl font-bold leading-tight">
											{booking.booking_items.length} поз. —{" "}
											{booking.booking_items[0]?.equipment.title}
										</h3>
										<div className="flex flex-wrap gap-2">
											{booking.booking_items
												.slice(1)
												.map((item: Booking, idx: number) => (
													<span
														key={`${item}` + `${idx}`}
														className="text-[10px] bg-foreground/5 border border-white/5 px-2 py-1 rounded-lg text-muted-foreground"
													>
														{item.equipment?.title}
													</span>
												))}
										</div>
									</div>

									<div className="flex items-center gap-6 pt-2">
										<div className="flex items-center gap-2 text-sm">
											<CalendarIcon size={14} className="text-primary" />
											<span className="font-semibold">
												{format(new Date(booking.start_date), "d MMM", {
													locale: ru,
												})}{" "}
												—{" "}
												{format(new Date(booking.end_date), "d MMM", {
													locale: ru,
												})}
											</span>
										</div>
										{/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
										<span>Студия "Центр"</span>
									</div> */}
									</div>
								</div>

								{/* Правая часть */}
								<div className="flex flex-col justify-between items-end gap-6">
									<div className="text-right">
										<div className="text-[10px] uppercase opacity-50 font-bold mb-1">
											К оплате
										</div>
										<div className="text-xl font-black text-primary italic leading-none">
											{booking.total_amount.toLocaleString()}₽
										</div>
									</div>

									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												size="sm"
												className="rounded-xl border-white/10"
											>
												Детали <ArrowRight size={14} className="ml-2" />
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-2xl w-[95vw] rounded-[2rem] glass-card border-foreground/10 overflow-hidden">
											<DialogHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
												<div className="space-y-1">
													<DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
														Смета №{booking.id.split("-")[0]}
													</DialogTitle>
													<span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold uppercase">
														{booking.status}
													</span>
												</div>
												<Button variant="ghost" size="icon" title="Скачать PDF">
													<FileText size={18} />
												</Button>
											</DialogHeader>

											<div className="space-y-6 pt-4">
												{/* Информация о времени */}
												<div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-foreground/5 border border-foreground/5">
													<div>
														<p className="text-[10px] uppercase opacity-50 font-bold">
															Начало
														</p>
														<p className="text-sm font-bold">
															{format(new Date(booking.start_date), "PPp", {
																locale: ru,
															})}
														</p>
													</div>
													<div>
														<p className="text-[10px] uppercase opacity-50 font-bold">
															Возврат
														</p>
														<p className="text-sm font-bold">
															{format(new Date(booking.end_date), "PPp", {
																locale: ru,
															})}
														</p>
													</div>
													<div>
														<p className="text-[10px] uppercase opacity-50 font-bold">
															Длительность
														</p>
														<p className="text-sm font-bold">
															{Math.ceil(
																differenceInHours(
																	new Date(booking.end_date),
																	new Date(booking.start_date)
																)
															)}{" "}
															ч.
														</p>
													</div>
												</div>

												{/* Таблица позиций */}
												{/* ТАБЛИЦА С ФИКСОМ ШИРИНЫ */}
												<div className="rounded-xl border border-white/5 overflow-x-auto">
													<Table>
														<TableHeader className="bg-white/5">
															<TableRow className="hover:bg-transparent border-white/5">
																<TableHead className="text-[10px] uppercase font-bold w-[60%]">
																	Позиция
																</TableHead>
																<TableHead className="text-[10px] uppercase font-bold text-center">
																	Часы
																</TableHead>
																<TableHead className="text-[10px] uppercase font-bold text-right">
																	Сумма
																</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{booking.booking_items.map((item: Booking) => (
																<TableRow
																	key={item.id}
																	className="border-white/5"
																>
																	<TableCell className="py-3">
																		<p className="font-bold text-sm truncate max-w-45">
																			{item.equipment?.title}
																		</p>
																		<div className="flex gap-2 text-[9px] uppercase opacity-50">
																			<span>
																				Залог:{" "}
																				{item.deposit_at_booking ||
																					item.equipment?.deposit ||
																					0}
																				₽
																			</span>
																			<span>
																				Страховка:{" "}
																				{item.insurance_included ? "Да" : "Нет"}
																			</span>
																		</div>
																	</TableCell>
																	<TableCell className="text-center font-mono text-xs">
																		{hours}ч
																	</TableCell>
																	<TableCell className="text-right font-mono font-bold text-primary">
																		{(
																			item.price_at_booking || 0
																		).toLocaleString()}
																		₽
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</div>
												{/* Итого */}
												<div className="flex justify-between items-center p-2">
													<Link href={`/bookings/${booking.id}`}>
														<Button
															variant="link"
															className="text-muted-foreground text-xs p-0 h-auto hover:text-primary"
														>
															Открыть страницу заказа{" "}
															<ExternalLink size={12} className="ml-1" />
														</Button>
													</Link>
													<div className="text-right">
														<p className="text-[10px] uppercase opacity-50 font-bold">
															Итого
														</p>
														<p className="text-3xl font-black italic text-primary">
															{booking.total_amount.toLocaleString()}₽
														</p>
													</div>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								</div>
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
