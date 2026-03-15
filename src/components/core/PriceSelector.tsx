"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PriceSelectorProps {
	prices: { day: number; h4: number; h8: number };
	action?: React.ReactNode;
	variant?: "catalog" | "details";
	className?: string;
}

const OPTIONS = [
	{ id: "h4" as const, label: "4-ч", labelFull: "4 часа" },
	{ id: "h8" as const, label: "8-ч", labelFull: "8 часов" },
	{ id: "day" as const, label: "сут", labelFull: "сутки" },
] as const;

export function PriceSelector({
	prices,
	action,
	variant = "catalog",
	className,
}: PriceSelectorProps) {
	const [period, setPeriod] = useState<"day" | "h4" | "h8">("h4");
	const priceMap = { h4: prices.h4, h8: prices.h8, day: prices.day };
	const currentPrice = (priceMap[period] || 0).toLocaleString("ru");

	const isDetails = variant === "details";

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			{/* ── Pills ── */}
			<div className="flex items-center w-full rounded-xl bg-muted-foreground/15 p-1 gap-1">
				{OPTIONS.map((opt) => (
					<button
						key={opt.id}
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setPeriod(opt.id);
						}}
						className={cn(
							"flex-1 rounded-lg py-2 transition-all duration-200 text-[9px] sm:text-xs font-bold uppercase tracking-wide",
							period === opt.id
								? "bg-background shadow-sm text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						{opt.labelFull}
					</button>
				))}
			</div>

			{/* ── Price & Actions ── */}
			<div
				className={cn(
					"flex items-center justify-between gap-4",
					isDetails
						? "flex-row"
						: "flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3"
				)}
			>
				<div className="flex items-baseline gap-1">
					<span
						className={cn(
							"font-black leading-none",
							isDetails ? "text-2xl md:text-3xl" : "text-xl"
						)}
					>
						{currentPrice}
					</span>
					<span
						className={cn(
							"font-bold text-muted-foreground",
							isDetails ? "text-sm" : "text-xs"
						)}
					>
						₽
					</span>
				</div>

				{action && (
					<div
						className={cn("shrink-0 w-full sm:w-fit", isDetails && "flex-1")}
					>
						{action}
					</div>
				)}
			</div>
		</div>
	);
}
