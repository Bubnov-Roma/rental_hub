"use client";

import NProgress from "nprogress";
import { useEffect, useRef, useState } from "react";
import { checkAvailabilityAction } from "@/actions/booking-actions";

/**
 * Хук для проверки доступности оборудования на выбранный период
 *
 * Автоматически проверяет доступность когда меняются даты/времена,
 * управляет loading state и обработкой ошибок.
 *
 * @param equipmentIds - ID оборудования для проверки
 * @param startDate - Дата начала периода (в ISO формате)
 * @param endDate - Дата конца периода (в ISO формате)
 * @param enabled - Включена ли проверка (по умолчанию true)
 */
export function useAvailabilityCheck(
	equipmentIds: string[],
	startDate: string | null,
	endDate: string | null,
	enabled = true
) {
	const [isChecking, setIsChecking] = useState(false);
	const [busyIds, setBusyIds] = useState<string[]>([]);
	const cancelledRef = useRef(false);

	useEffect(() => {
		cancelledRef.current = false;
		let timeoutId: NodeJS.Timeout | null = null;

		const checkAvailability = async () => {
			if (!enabled || !startDate || !endDate || !equipmentIds.length) {
				setBusyIds([]);
				return;
			}

			setIsChecking(true);
			NProgress.start();

			try {
				const result = await checkAvailabilityAction(
					equipmentIds,
					startDate,
					endDate
				);

				if (!cancelledRef.current) {
					setBusyIds(result.busyIds ?? []);
				}
			} catch (error) {
				console.error("Availability check error:", error);
				if (!cancelledRef.current) {
					setBusyIds([]);
				}
			} finally {
				if (!cancelledRef.current) {
					setIsChecking(false);
					NProgress.done();
				}
			}
		};

		timeoutId = setTimeout(checkAvailability, 300);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			cancelledRef.current = true;
		};
	}, [equipmentIds, startDate, endDate, enabled]);

	return {
		isChecking,
		busyIds,
		hasConflict: busyIds.length > 0,
	};
}
