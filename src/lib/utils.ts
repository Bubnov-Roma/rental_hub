import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Equipment } from "@/core/domain/entities/Equipment";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Длина рабочего дня (часы выдачи/приёма 10:00–20:00)
const WORK_DAY_HOURS = 10;

/**
 * Расчёт цены с учётом рабочих тарифов и рабочего дня 10 ч.
 *
 * Логика:
 *   ≤ 4 ч  → тариф p4  (если задан)
 *   ≤ 8 ч  → тариф p8  (если задан)
 *   ≤ 10 ч → тариф pDay (один рабочий день)
 *   > 10 ч → полные рабочие дни × pDay + остаток по тарифной сетке
 *
 * "Полный рабочий день" = 10 ч, а не 24, т.к. техника
 * выдаётся и возвращается в рабочее время (10:00–20:00).
 */
export function calculateItemPrice(
	equipment: Equipment,
	hours: number
): number {
	const p4 = Number(equipment.price_4h) || 0;
	const p8 = Number(equipment.price_8h) || 0;
	const pDay = Number(equipment.price_per_day) || 0;

	if (hours <= 0) return 0;

	// ── В пределах одного рабочего дня ──────────────────────────────────────
	if (hours <= WORK_DAY_HOURS) {
		if (hours <= 4 && p4 > 0) return p4;
		if (hours <= 8 && p8 > 0) return p8;
		return pDay;
	}

	// ── Несколько рабочих дней ───────────────────────────────────────────────
	const fullDays = Math.floor(hours / WORK_DAY_HOURS);
	const remainder = hours % WORK_DAY_HOURS;

	let total = fullDays * pDay;

	if (remainder > 0) {
		if (remainder <= 4 && p4 > 0) {
			total += p4;
		} else if (remainder <= 8 && p8 > 0) {
			total += p8;
		} else {
			total += pDay; // остаток > 8 ч — ещё один рабочий день
		}
	}

	return total;
}

/**
 * Утилита для сборки даты и времени без риска undefined
 */
export function combineDateAndTime(
	date: Date | undefined,
	timeString: string
): Date | null {
	if (!date) return null;
	const newDate = new Date(date);
	const [hours, minutes] = timeString.split(":").map(Number);
	if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
	if (hours !== undefined) newDate.setHours(hours, minutes, 0, 0);
	return newDate;
}

export type Fmt = "time" | "date" | "datetime" | "full";

export function clientTimeFormat(date: Date, fmt: Fmt): string {
	const timeOpts: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
	};
	const dateOpts: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "short",
	};
	switch (fmt) {
		case "time":
			return date.toLocaleTimeString("ru-RU", timeOpts);
		case "date":
			return date.toLocaleDateString("ru-RU", dateOpts);
		case "datetime":
			return `${date.toLocaleDateString("ru-RU", dateOpts)}, ${date.toLocaleTimeString("ru-RU", timeOpts)}`;
		case "full":
			return date.toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "long",
				year: "numeric",
			});
	}
}
