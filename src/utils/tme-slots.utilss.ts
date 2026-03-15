/**
 * time-slots.ts
 * Утилиты для работы со временем в форме бронирования.
 * Шаг — 10 минут, рабочий день 10:00–20:00.
 */

export const WORK_START = 10; // 10:00
export const WORK_END = 20; // 20:00
export const TIME_STEP = 10; // минуты

/** Все слоты в рабочем диапазоне с шагом TIME_STEP */
export function generateTimeSlots(
	fromHour = WORK_START,
	toHour = WORK_END
): string[] {
	const slots: string[] = [];
	for (let h = fromHour; h <= toHour; h++) {
		const maxMin = h === toHour ? 0 : 60 - TIME_STEP;
		for (let m = 0; m <= maxMin; m += TIME_STEP) {
			slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
		}
	}
	return slots;
}

export const ALL_SLOTS = generateTimeSlots();

/**
 * Зажимает время в рабочий диапазон.
 * Если selectedDate — сегодня, отрезает прошедшие слоты.
 */
export function clampTime(time: string, selectedDate?: Date): string {
	const workSlots = generateTimeSlots();
	const now = new Date();
	const isToday = selectedDate
		? selectedDate.toDateString() === now.toDateString()
		: false;

	const available = workSlots.filter((s) => {
		if (s < `${String(WORK_START).padStart(2, "0")}:00`) return false;
		if (s > `${String(WORK_END).padStart(2, "0")}:00`) return false;
		if (isToday) {
			const [h, m] = s.split(":").map(Number);
			const slotDate = new Date(now);
			if (h && m) slotDate.setHours(h, m, 0, 0);
			if (slotDate <= now) return false;
		}
		return true;
	});

	if (!available.length) return `${String(WORK_START).padStart(2, "0")}:00`;
	if (available.includes(time)) return time;

	// Найти ближайший доступный >= time
	const next = available.find((s) => s >= time);
	return (
		next ??
		available[available.length - 1] ??
		`${String(WORK_START).padStart(2, "0")}:00`
	);
}

/**
 * Первый доступный слот для выбранной даты.
 */
export function firstAvailableSlot(selectedDate?: Date): string {
	return clampTime(`${String(WORK_START).padStart(2, "0")}:00`, selectedDate);
}

/**
 * Форматирует дату коротко: "15 июн"
 */
export function formatShortDate(date: Date): string {
	return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/**
 * Форматирует дату полно: "15 июня, пт"
 */
export function formatFullDate(date: Date): string {
	return date.toLocaleDateString("ru-RU", {
		day: "numeric",
		month: "long",
		weekday: "short",
	});
}
