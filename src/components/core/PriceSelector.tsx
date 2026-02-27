"use client";

import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface PriceSelectorProps {
	prices: { day: number; h4: number; h8: number };
	action?: React.ReactNode;
	compact?: boolean;
}

const OPTIONS = [
	{ id: "h4" as const, label: "4-ч", labelFull: "4 часа" },
	{ id: "h8" as const, label: "8-ч", labelFull: "8 часов" },
	{ id: "day" as const, label: "сут", labelFull: "сутки" },
] as const;

export function PriceSelector({
	prices,
	action,
	compact = true,
}: PriceSelectorProps) {
	const [period, setPeriod] = useState<"day" | "h4" | "h8">("day");
	const priceMap = { h4: prices.h4, h8: prices.h8, day: prices.day };
	const currentPrice = (priceMap[period] || 0).toLocaleString("ru");

	return (
		<>
			{/* ── Десктоп версия (скрыта на sm) ── */}
			<div className="hidden sm:block space-y-3">
				{/* Переключатель */}
				<div className="flex items-center w-full rounded-lg bg-foreground/6 p-0.5 gap-px">
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
								"flex-1 rounded-md py-2 transition-all duration-150",
								"text-[10px] font-bold uppercase tracking-wide leading-none",
								period === opt.id
									? "bg-background shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							{opt.labelFull}
						</button>
					))}
				</div>

				{/* Цена + кнопка */}
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-baseline gap-0.5">
						<span
							className={cn(
								"font-black text-foreground leading-none",
								compact ? "text-2xl" : "text-2xl"
							)}
						>
							{currentPrice}
						</span>
						<span className="font-black text-foreground leading-none">₽</span>
					</div>
					{action && <div className="shrink-0 relative z-20">{action}</div>}
				</div>
			</div>

			{/* ── Мобильная версия (скрыта на sm+) ── */}
			<div className="sm:hidden space-y-2 flex-col">
				<div className="flex items-center w-full justify-between gap-2">
					{/* ИСПРАВЛЕННЫЙ SELECT */}
					{/* 1. value и onValueChange вместо onClick в SelectItem */}
					<Select
						value={period}
						onValueChange={(val: "day" | "h4" | "h8") => setPeriod(val)}
					>
						<SelectTrigger
							className={cn(
								"h-11 min-w-21.25 rounded-xl border-none bg-muted-foreground/15 px-3 py-0 focus:ring-0",
								"font-bold uppercase tracking-wider text-xs"
							)}
							onClick={(e) => e.stopPropagation()}
						>
							<SelectValue />
						</SelectTrigger>

						<SelectContent
							onClick={(e) => e.stopPropagation()}
							sideOffset={5}
							className={cn(
								"w-[calc(100vw-1rem)] sm:w-(--radix-select-trigger-width)",
								"max-w-44",
								"min-w-(--radix-select-trigger-width)"
							)}
						>
							<SelectGroup className="w-full">
								{OPTIONS.map((opt) => (
									<SelectItem
										value={opt.id}
										key={opt.id}
										className="font-bold text-md uppercase tracking-wide cursor-pointer space-y-4"
									>
										{opt.labelFull}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>

					{/* Цена */}
					<div className="ml-auto flex items-baseline gap-0.5 shrink-0 text-right">
						<span className="font-black text-xl text-foreground leading-none">
							{currentPrice}
						</span>
						<span className="text-[10px] text-muted-foreground">₽</span>
					</div>
				</div>

				{action && <div className="relative z-20 w-full pt-1">{action}</div>}
			</div>
		</>
	);
}
