"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
	selected?: { from: Date | null; to: Date | null };
	onSelect?: (dates: { from: Date | null; to: Date | null } | undefined) => void;
	disabledDates?: Date[];
	className?: string;
}

export function DatePicker({ selected, onSelect, disabledDates, className }: DatePickerProps) {
	const [date, setDate] = React.useState<{ from: Date | null; to: Date | null }>(
		selected || { from: null, to: null }
	);

	const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
		const newDate = {
			from: range?.from || null,
			to: range?.to || null,
		};
		setDate(newDate);
		onSelect?.(newDate);
	};

	return (
		<div className={cn("grid gap-2", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date"
						variant="outline"
						className={cn(
							"w-full justify-start text-left font-normal",
							!date.from && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{date.from ? (
							date.to ? (
								<>
									{format(date.from, "dd MMMM yyyy", { locale: ru })} -{" "}
									{format(date.to, "dd MMMM yyyy", { locale: ru })}
								</>
							) : (
								format(date.from, "dd MMMM yyyy", { locale: ru })
							)
						) : (
							<span>Выберите даты аренды</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="range"
						defaultMonth={date.from || new Date()}
						selected={{ from: date.from || undefined, to: date.to || undefined }}
						onSelect={(selectedRange) => {
							const range = selectedRange as { from?: Date; to?: Date } | undefined;
							handleSelect(range);
						}}
						numberOfMonths={2}
						locale={ru}
						disabled={(date) => {
							if (disabledDates) {
								return disabledDates.some(
									(disabledDate) => date.toDateString() === disabledDate.toDateString()
								);
							}
							return date < new Date(new Date().setHours(0, 0, 0, 0));
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
