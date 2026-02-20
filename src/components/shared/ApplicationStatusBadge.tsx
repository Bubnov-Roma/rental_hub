"use client";

import { useApplicationStatus } from "@/hooks";
import { cn } from "@/lib/utils";

interface ApplicationStatusBadgeProps {
	variant?: "compact" | "full";
	className?: string;
}

/**
 * Универсальный badge статуса анкеты.
 * Обновляется мгновенно через zustand (realtime Supabase).
 *
 * Использование в шапке профиля:
 * <ApplicationStatusBadge variant="compact" />
 */
export function ApplicationStatusBadge({
	variant = "compact",
	className,
}: ApplicationStatusBadgeProps) {
	const { config } = useApplicationStatus();
	const { Icon, label, description, color, bgColor, borderColor } = config;

	if (variant === "compact") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
					bgColor,
					borderColor,
					color,
					className
				)}
			>
				<Icon className="w-3 h-3" />
				{label}
			</span>
		);
	}

	return (
		<div
			className={cn(
				"flex items-start gap-3 p-4 rounded-xl border",
				bgColor,
				borderColor,
				className
			)}
		>
			<div className={cn("mt-0.5 shrink-0", color)}>
				<Icon className="w-5 h-5" />
			</div>
			<div className="space-y-0.5">
				<p className={cn("text-sm font-semibold", color)}>{label}</p>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>
		</div>
	);
}
