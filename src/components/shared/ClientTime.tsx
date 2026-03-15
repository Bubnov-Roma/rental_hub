"use client";

import { clientTimeFormat, type Fmt } from "@/lib/utils";
// ClientTime — безопасный компонент для отображения времени.
//
// ПОЧЕМУ ВОЗНИКАЕТ HYDRATION ERROR:
//   Сервер (Node.js) форматирует дату в UTC или серверной timezone.
//   Клиент (браузер) форматирует в локальной timezone пользователя.
//   Если пользователь в UTC+3, "19:30" на сервере → "22:30" на клиенте.
//   React видит несовпадение → hydration error.
//
// КАК ИСПОЛЬЗОВАТЬ — замени форматирование дат в BookingPreviewRow:
//
//   // Было (вызывает hydration error):
//   <span>{format(new Date(booking.start_date), "HH:mm")}</span>
//   <span>{new Date(booking.end_date).toLocaleTimeString()}</span>
//
// Стало (гидратация-безопасно):
//   <ClientTime iso={booking.start_date} />
//   <ClientTime iso={booking.end_date} fmt="datetime" />

import { useEffect, useState } from "react";

interface ClientTimeProps {
	/** ISO строка: "2024-03-15T19:30:00Z" или Date объект */
	iso: string | Date;
	fmt?: Fmt;
	className?: string;
	fallback?: string;
}

export function ClientTime({
	iso,
	fmt = "time",
	className,
	fallback = "",
}: ClientTimeProps) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<span className={className} suppressHydrationWarning>
			{mounted ? clientTimeFormat(new Date(iso), fmt) : fallback}
		</span>
	);
}
