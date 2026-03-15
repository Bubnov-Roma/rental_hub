import type { BookingStatus } from "@/types";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
	pending_review: "Проверка техники",
	wait_payment: "Ожидает оплаты",
	ready_to_rent: "Готов к выдаче",
	active: "В аренде",
	completed: "Завершён",
	cancelled: "Отменён",
	expired: "Просрочен",
};

export const STATUS_STEPS: {
	key: BookingStatus;
	label: string;
	desc: string;
}[] = [
	{
		key: "pending_review",
		label: "Проверка",
		desc: "Менеджер проверяет наличие техники",
	},
	{
		key: "wait_payment",
		label: "Оплата",
		desc: "Заказ собран, ожидается внесение предоплаты",
	},
	{
		key: "ready_to_rent",
		label: "Выдача",
		desc: "Заказ подтверждён, техника готова к выдаче",
	},
	{
		key: "active",
		label: "Аренда",
		desc: "Техника находится в аренде",
	},
	{ key: "completed", label: "Завершён", desc: "Заказ успешно завершён" },
];

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
	pending_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	wait_payment: "bg-green-500/10 text-green-400 border-green-500/20",
	ready_to_rent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	active: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	completed: "bg-foreground/5 text-muted-foreground border-foreground/10",
	cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
	expired: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

// ─── Status config ────────────────────────────────────────────────────────────

export const BOOKING_STATUS_CONFIG: Record<
	BookingStatus,
	{ label: string; color: string; dot: string }
> = {
	pending_review: {
		label: "Ожидает проверки",
		color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
		dot: "bg-amber-400",
	},
	wait_payment: {
		label: "Ждёт оплаты",
		color: "bg-blue-500/15 text-blue-400 border-blue-500/20",
		dot: "bg-blue-400",
	},
	ready_to_rent: {
		label: "Готов к выдаче",
		color: "bg-green-500/15 text-green-400 border-green-500/20",
		dot: "bg-green-400",
	},
	active: {
		label: "В аренде",
		color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
		dot: "bg-emerald-400",
	},
	completed: {
		label: "Завершён",
		color: "bg-foreground/8 text-foreground/50 border-foreground/10",
		dot: "bg-foreground/30",
	},
	cancelled: {
		label: "Отменён",
		color: "bg-red-500/15 text-red-400 border-red-500/20",
		dot: "bg-red-400",
	},
	expired: {
		label: "Истёк",
		color: "bg-orange-500/15 text-orange-400 border-orange-500/20",
		dot: "bg-orange-400",
	},
};

// Quick cancellation reason presets shown in the dialog
export const CANCELLATION_PRESETS = [
	"Отменились съёмки",
	"Нужная техника оказалась недоступна",
	"Техника была занята в нужное время",
	"Нашёл другой прокат",
	"Изменились даты съёмок",
	"Указать свою причину",
] as const;

export type CancellationPreset = (typeof CANCELLATION_PRESETS)[number];
