"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingButtonProps {
	onClick: () => void;
	disabled?: boolean;
	loading?: boolean;
	isLoggedIn?: boolean;
	mode?: "new" | "update";
	className?: string;
}

export function BookingButton({
	onClick,
	disabled = false,
	loading = false,
	isLoggedIn = true,
	mode = "new",
	className,
}: BookingButtonProps) {
	const isDisabled = disabled || loading;

	const label = !isLoggedIn
		? "Войти и забронировать"
		: mode === "update"
			? "Обновить заказ"
			: "Отправить заявку на бронирование";

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={isDisabled}
			className={cn(
				"relative w-full h-14 rounded-2xl",
				"flex items-center justify-center gap-2.5",
				"text-sm font-black uppercase italic tracking-wide",
				"transition-all duration-200",
				isDisabled
					? "bg-foreground/5 text-muted-foreground/40 cursor-not-allowed border border-foreground/5"
					: "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98]",
				className
			)}
		>
			{loading ? (
				<span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
			) : !isLoggedIn ? (
				<>
					<Lock size={14} />
					{label}
				</>
			) : (
				label
			)}
		</button>
	);
}
