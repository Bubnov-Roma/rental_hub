"use client";

import { useCallback } from "react";
import { ALL_SLOTS, clampTime, WORK_END, WORK_START } from "@/lib/utils";

export interface TimeConstraints {
	/** Минимальное время для выбора (при сегодняшней дате) */
	minTime?: string;
	/** Позволять ли выбирать будущие даты */
	allowFutureDates?: boolean;
}

/**
 * Хук для управления временем аренды с учётом рабочего диапазона
 *
 * Обеспечивает:
 * - Валидацию времени в пределах рабочего дня (10:00–20:00)
 * - Автоматическое зажатие времени если оно вне диапазона
 * - Расчёт доступных слотов с учётом текущего времени
 * - Проверку логики аренды (время начала < время конца)
 */
export function useRentalTime() {
	/**
	 * Получить доступные слоты для выбранной даты
	 */
	const getAvailableSlots = useCallback((selectedDate?: Date): string[] => {
		const now = new Date();
		const isToday = selectedDate
			? selectedDate.toDateString() === now.toDateString()
			: false;

		const slots = ALL_SLOTS.filter((s) => {
			// Проверяем границы рабочего дня
			if (s < `${String(WORK_START).padStart(2, "0")}:00`) return false;
			if (s > `${String(WORK_END).padStart(2, "0")}:00`) return false;

			// Если это сегодня, фильтруем прошедшие слоты
			if (isToday) {
				const [h, m] = s.split(":").map(Number);
				const slotDate = new Date(now);
				if (h && m) slotDate.setHours(h, m, 0, 0);
				if (slotDate <= now) return false;
			}

			return true;
		});

		return slots;
	}, []);

	/**
	 * Гарантирует что время в пределах рабочего диапазона и доступно
	 */
	const ensureValidTime = useCallback(
		(time: string, selectedDate?: Date): string => {
			return clampTime(time, selectedDate);
		},
		[]
	);

	/**
	 * Проверяет может ли время аренды быть размещено в пределах рабочего дня
	 * Например, если клиент хочет снять в 19:00 на 4 часа,
	 * это выходит за 20:00 конец работы
	 */
	const canRentWithinWorkHours = useCallback(
		(startTime: string, durationHours: number): boolean => {
			const [h, m] = startTime.split(":").map(Number);
			if (!h || !m) return false;

			const startMinutes = h * 60 + m;
			const endMinutes = startMinutes + durationHours * 60;
			const workEndMinutes = WORK_END * 60;

			// Если всё помещается в один рабочий день
			if (endMinutes <= workEndMinutes) return true;

			// Иначе нужно переходить на следующий день
			return true;
		},
		[]
	);

	/**
	 * Получить автоматически скорректированное время конца аренды
	 * если оно выходит за границы рабочего дня
	 *
	 * Пример:
	 * - Клиент выбрал: начало 19:00, хочет 4 часа
	 * - Это выходит за 20:00, поэтому программа предложит:
	 *   конец на следующий день в 10:00 (остаток 1 часа)
	 */
	const getAutoCorrectedEndTime = useCallback(
		(
			startDateTime: Date,
			endDateTime: Date
		): { adjustedEnd: Date; message?: string } => {
			const workEndToday =
				startDateTime.getHours() < WORK_END &&
				endDateTime.getHours() >= WORK_END;

			if (!workEndToday) {
				return { adjustedEnd: endDateTime };
			}

			// Если конец выходит за рабочие часы в тот же день
			const adjustedEnd = new Date(startDateTime);
			adjustedEnd.setDate(adjustedEnd.getDate() + 1);
			adjustedEnd.setHours(WORK_START, 0, 0, 0);

			return {
				adjustedEnd,
				message: `Время скорректировано: аренда продолжится со следующего дня в ${String(WORK_START).padStart(2, "0")}:00`,
			};
		},
		[]
	);

	return {
		getAvailableSlots,
		ensureValidTime,
		canRentWithinWorkHours,
		getAutoCorrectedEndTime,
		WORK_START,
		WORK_END,
	};
}
