"use client";

import { differenceInDays, format } from "date-fns";
import { ru } from "date-fns/locale";
import {
	Calendar as CalendarIcon,
	Check,
	Clock,
	Clock4,
	MapPin,
	Shield,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { createBookingAction } from "@/app/actions/booking";
import {
	Button,
	Calendar,
	Card,
	CardContent,
	CardFooter,
	Field,
	FieldGroup,
	FieldLabel,
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui";
import type { Equipment } from "@/core/domain/entities/Equipment";
import { cn } from "@/lib/utils";

export function BookingForm({ equipment }: { equipment: Equipment }) {
	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(),
		to: undefined,
	});
	const [insurance, setInsurance] = useState(true);

	// Расчет стоимости
	const bookingSummary = useMemo(() => {
		if (!date?.from || !date?.to)
			return { days: 0, total: 0, equipCost: 0, insCost: 0 };

		const days = differenceInDays(date.to, date.from) + 1;
		const equipCost = days * equipment.price_per_day;
		const insCost = insurance ? 500 * days : 0;

		return {
			days,
			equipCost,
			insCost,
			total: equipCost + insCost,
		};
	}, [date, insurance, equipment.price_per_day]);

	const handleFinalBook = async () => {
		if (!date?.from || !date?.to) {
			toast.error("Выберите даты");
			return;
		}

		const result = await createBookingAction({
			items: [
				{
					id: equipment.id,
					price_to_pay: equipment.price_per_day,
				},
			],
			startDate: date.from.toISOString(),
			endDate: date.to.toISOString(),
			totalPrice: bookingSummary.total,
			hasInsurance: insurance,
			totalReplacementValue: Number(equipment.replacement_value) || 0,
		});

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Заявка успешно отправлена!");
			// Можно редиректить в личный кабинет
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
			{/* Левая колонка: Галерея и инфо */}
			<div className="lg:col-span-7 space-y-8">
				<div className="relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 bg-muted">
					<Image
						src={equipment.imageUrl}
						alt={equipment.title}
						fill
						className="object-cover"
					/>
				</div>

				<div className="glass-container p-8 rounded-[2rem] space-y-6">
					<h2 className="text-2xl font-bold uppercase italic tracking-tighter">
						Описание
					</h2>
					<p className="text-muted-foreground leading-relaxed">
						{equipment.description}
					</p>
				</div>
			</div>

			{/* Правая колонка: Карта бронирования */}
			<div className="lg:col-span-5">
				<div className="sticky top-24 glass-container p-8 rounded-[2.5rem] border-primary/20 bg-primary/5 space-y-6">
					<div className="space-y-2">
						<h1 className="text-3xl font-black uppercase italic leading-none">
							{equipment.title}
						</h1>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							<MapPin size={14} /> <span>Москва, Студия "Центр"</span>
						</div>
					</div>

					{/* Выбор дат */}
					<div className="space-y-3">
						<Label className="text-[10px] font-bold uppercase tracking-widest opacity-50 ml-1">
							Период аренды
						</Label>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full h-14 justify-start text-left font-semibold rounded-2xl border-white/10 bg-background/50",
										!date && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4 text-primary" />
									{date?.from ? (
										date.to ? (
											<>
												{format(date.from, "dd MMM", { locale: ru })} —{" "}
												{format(date.to, "dd MMM", { locale: ru })}
											</>
										) : (
											format(date.from, "dd MMM", { locale: ru })
										)
									) : (
										<span>Выберите даты</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-auto p-0 bg-background border-white/10"
								align="start"
							>
								<Card className="mx-auto w-fit">
									<CardContent>
										<Calendar
											mode="range"
											{...(date?.from ? { defaultMonth: date.from } : {})}
											selected={date}
											onSelect={setDate}
											numberOfMonths={2}
											locale={ru}
											disabled={(d) =>
												d < new Date() || d < new Date("2024-01-01")
											}
										/>
										<CardFooter className="bg-card border-t">
											<FieldGroup>
												<Field>
													<FieldLabel htmlFor="time-from">
														Start Time
													</FieldLabel>
													<InputGroup>
														<InputGroupInput
															id="time-from"
															type="time"
															step="1"
															defaultValue="10:30:00"
															className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
														/>
														<InputGroupAddon>
															<Clock className="text-muted-foreground" />
														</InputGroupAddon>
													</InputGroup>
												</Field>
												<Field>
													<FieldLabel htmlFor="time-to">End Time</FieldLabel>
													<InputGroup>
														<InputGroupInput
															id="time-to"
															type="time"
															step="1"
															defaultValue="12:30:00"
															className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
														/>
														<InputGroupAddon>
															<Clock4 className="text-muted-foreground" />
														</InputGroupAddon>
													</InputGroup>
												</Field>
											</FieldGroup>
										</CardFooter>
									</CardContent>
								</Card>
							</PopoverContent>
						</Popover>
					</div>

					{/* Страховка */}
					<button
						type="button"
						className={cn(
							"p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
							insurance
								? "bg-primary/10 border-primary/30"
								: "bg-white/5 border-white/5"
						)}
						onClick={() => setInsurance(!insurance)}
					>
						<div className="flex items-center gap-3">
							<Shield
								className={insurance ? "text-primary" : "text-muted-foreground"}
							/>
							<div>
								<div className="text-xs font-bold uppercase">
									Полная страховка
								</div>
								<div className="text-[10px] opacity-60">
									Покрывает до 100% ущерба
								</div>
							</div>
						</div>
						<div className="font-bold text-sm">500₽ / дн.</div>
					</button>

					{/* Итог */}
					<div className="pt-6 border-t border-white/5 space-y-3">
						<div className="flex justify-between text-sm">
							<span className="opacity-60">
								Аренда ({bookingSummary.days} дн.)
							</span>
							<span className="font-bold">{bookingSummary.equipCost}₽</span>
						</div>
						{insurance && (
							<div className="flex justify-between text-sm">
								<span className="opacity-60">Страхование</span>
								<span className="font-bold text-primary">
									+{bookingSummary.insCost}₽
								</span>
							</div>
						)}
						<div className="flex justify-between items-end pt-2">
							<span className="text-xl font-black uppercase italic">Итого</span>
							<div className="text-right">
								<div className="text-3xl font-black text-primary leading-none">
									{bookingSummary.total}₽
								</div>
							</div>
						</div>
					</div>

					<Button
						disabled={!date?.to}
						className="w-full h-16 rounded-2xl text-lg font-bold uppercase italic shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
						onClick={handleFinalBook}
					>
						<Check className="mr-2" /> Забронировать
					</Button>
				</div>
			</div>
		</div>
	);
}
