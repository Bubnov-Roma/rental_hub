"use client";

import { addHours, differenceInMinutes, format } from "date-fns";
import { ru } from "date-fns/locale";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import {
	checkAvailabilityAction,
	createBookingAction,
} from "@/app/actions/booking";
import {
	Button,
	Calendar,
	Card,
	CardContent,
	CardFooter,
	FieldLabel,
	InputGroupInput,
	Skeleton,
} from "@/components/ui";
import { calculateItemPrice, cn, combineDateAndTime } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";

export default function CheckoutPage() {
	const router = useRouter();
	const { items, clearCart } = useCartStore();
	const [date, setDate] = useState<DateRange | undefined>();
	const [busyIds, setBusyIds] = useState<string[]>([]);
	const [isValidating, setIsValidating] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [startTime, setStartTime] = useState("10:00");
	const [endTime, setEndTime] = useState("18:00");

	const math = useMemo(() => {
		// Early Return
		if (!date?.from || !date?.to) {
			return {
				totalRental: 0,
				totalRV: 0,
				days: 0,
				startFull: null,
				endFull: null,
			};
		}

		const startFull = combineDateAndTime(date.from, startTime);
		const endFull = combineDateAndTime(date.to, endTime);

		if (!startFull || !endFull) {
			return {
				totalRental: 0,
				totalRV: 0,
				days: 0,
				startFull: null,
				endFull: null,
			};
		}

		const diffInMins = differenceInMinutes(endFull, startFull);
		const totalHours = diffInMins / 60;

		const totalRental = items.reduce((sum, item) => {
			return sum + calculateItemPrice(item.equipment, totalHours);
		}, 0);

		const totalRV = items.reduce(
			(sum, i) => sum + (Number(i.equipment.replacement_value) || 0),
			0
		);

		return {
			totalRV,
			totalRental,
			startFull,
			endFull,
			hours: totalHours,
			days: Math.ceil(totalHours / 24),
		};
	}, [date, startTime, endTime, items]);

	// check available
	useEffect(() => {
		async function validate() {
			if (date?.from && date?.to) {
				setIsValidating(true);
				const ids = items.map((i) => i.equipment.id);
				const result = await checkAvailabilityAction(
					ids,
					date.from.toISOString(),
					date.to.toISOString()
				);
				if (result.busyIds) setBusyIds(result.busyIds);
				setIsValidating(false);
			} else {
				setBusyIds([]);
			}
		}
		validate();
	}, [date, items]);

	// Кнопка активна только если выбраны даты и нет занятых товаров
	const isCanBook =
		date?.from && date?.to && busyIds.length === 0 && !isValidating;

	const handleConfirm = async () => {
		// Проверяем все условия + наличие дат из math
		if (!isCanBook || !math.startFull || !math.endFull) {
			toast.error("Проверьте выбранные даты и время");
			return;
		}

		setIsSubmitting(true);

		const result = await createBookingAction({
			items: items.map((i) => ({
				id: i.equipment.id,
				price_to_pay: i.equipment.price_per_day,
			})),
			// Теперь мы уверены, что toISOString() не упадет
			startDate: math.startFull.toISOString(),
			endDate: math.endFull.toISOString(),
			totalPrice: math.totalRental,
			hasInsurance: true,
			totalReplacementValue: math.totalRV,
		});

		if (result.success) {
			toast.success("Заказ успешно оформлен!");
			clearCart();
			router.push("/dashboard");
		} else {
			toast.error(result.error);
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 py-10 px-4">
			<div className="lg:col-span-7 space-y-6">
				<h1 className="text-4xl font-black italic uppercase tracking-tighter">
					Оформление
				</h1>

				<div className="glass-container p-6 rounded-[2rem] border-primary/20 bg-primary/5">
					<h3 className="font-bold mb-4 uppercase text-sm opacity-60">
						1. Выбор дат
					</h3>

					<Card className="mx-auto w-fit p-0 rounded-xl">
						<CardContent>
							<Calendar
								mode="range"
								selected={date}
								onSelect={setDate}
								locale={ru}
								disabled={(d) =>
									d < new Date() || d > addHours(new Date(), 24 * 30 * 12)
								}
								className="rounded-md"
								captionLayout="dropdown"
							/>
						</CardContent>
						<CardFooter className="bg-muted-foreground/10 border-t p-4">
							<div className="flex gap-12 w-full justify-center items-center">
								<div className="space-y-1 max-w-fit">
									<FieldLabel
										htmlFor="time-from"
										className="text-[10px] uppercase opacity-50 flex items-center gap-1 pl-3"
									>
										Начало
									</FieldLabel>
									<InputGroupInput
										id="time-from"
										type="time"
										value={startTime}
										step="300"
										onChange={(e) => setStartTime(e.target.value)}
										className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									/>
								</div>
								<div className="space-y-1 max-w-fit">
									<FieldLabel
										htmlFor="time-to"
										className="text-[10px] uppercase opacity-50 flex items-center gap-1 pl-3"
									>
										Конец
									</FieldLabel>
									<InputGroupInput
										id="time-to"
										type="time"
										value={endTime}
										step="300"
										onChange={(e) => setEndTime(e.target.value)}
										className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									/>
								</div>
							</div>
						</CardFooter>
					</Card>
				</div>

				<div className="space-y-3">
					<h3 className="font-bold uppercase text-sm opacity-60 ml-2">
						2. Проверка состава
					</h3>
					{items.map((item) => {
						const isBusy = busyIds.includes(item.equipment.id);
						return (
							<div
								key={item.equipment.id}
								className={cn(
									"flex justify-between items-center p-5 rounded-2xl border transition-all duration-300",
									isBusy
										? "bg-destructive/10 border-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)]"
										: "glass-container"
								)}
							>
								<div className="flex items-center gap-4">
									{isValidating ? (
										<Skeleton className="w-5 h-5 rounded-full" />
									) : isBusy ? (
										<AlertCircle
											className="text-destructive animate-pulse"
											size={20}
										/>
									) : (
										<Check className="text-primary" size={20} />
									)}
									<span
										className={cn("font-medium", isBusy && "text-destructive")}
									>
										{item.equipment.title}
									</span>
								</div>
								{isBusy && (
									<span className="text-[10px] font-bold text-destructive uppercase">
										Занято
									</span>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="lg:col-span-5">
				<div className="sticky top-24 glass-container p-8 rounded-[2.5rem] bg-primary/5 border-primary/20 space-y-6">
					<h2 className="text-2xl font-black uppercase italic">Итог заказа</h2>

					<div className="space-y-4 text-sm">
						<div className="flex flex-col gap-1">
							<span className="text-[10px] uppercase opacity-50 font-bold">
								Начало аренды
							</span>
							<div className="flex items-center justify-between group">
								<span className="text-sm">
									{math.startFull
										? format(math.startFull, "d MMMM yyyy", { locale: ru })
										: "—"}
								</span>
								<div className="flex-1 border-b border-dotted border-white/20 mx-2 mb-1" />
								<span className="font-bold text-primary">{startTime}</span>
							</div>
						</div>

						<div className="flex flex-col gap-1">
							<span className="text-[10px] uppercase opacity-50 font-bold">
								Конец аренды
							</span>
							<div className="flex items-center justify-between">
								<span className="text-sm">
									{math.endFull
										? format(math.endFull, "d MMMM yyyy", { locale: ru })
										: "—"}
								</span>
								<div className="flex-1 border-b border-dotted border-white/20 mx-2 mb-1" />
								<span className="font-bold text-primary">{endTime}</span>
							</div>
						</div>
						<div className="flex justify-between border-b border-white/5 pb-2">
							<span className="opacity-60">Период:</span>
							<span className="font-bold text-primary">
								{date?.from ? `${math.days} дн.` : "Не выбрано"}
							</span>
						</div>
						<div className="flex justify-between border-b border-white/5 pb-2">
							<span className="opacity-60 text-yellow-500">
								Залоговая стоимость:
							</span>
							<span className="font-bold text-yellow-500">{math.totalRV}₽</span>
						</div>
						<div className="flex justify-between items-end pt-4">
							<span className="text-xl font-black uppercase italic">
								К оплате:
							</span>
							<span className="text-4xl font-black text-primary">
								{math.totalRental}₽
							</span>
						</div>
					</div>

					<Button
						disabled={!isCanBook || isSubmitting}
						onClick={handleConfirm}
						className="w-full h-20 rounded-2xl text-xl font-black uppercase italic shadow-2xl shadow-primary/20"
					>
						{isSubmitting ? (
							<Loader2 className="animate-spin" />
						) : (
							"Забронировать"
						)}
					</Button>

					{!isCanBook && date?.to && (
						<p className="text-center text-xs text-destructive font-bold animate-bounce">
							{busyIds.length > 0
								? "Некоторые товары заняты"
								: "Проверка доступности..."}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
