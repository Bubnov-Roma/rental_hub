"use client";

import { ru } from "date-fns/locale/ru";
import { Calendar as CalendarIcon } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";

// !IMPORTANT: styles must be imported for react-datepicker to work
import "react-datepicker/dist/react-datepicker.css";
// import "./date-picker-custom.css"; // For custom styles

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Register locale
registerLocale("ru", ru);

interface DateTimeRangePickerProps {
	startDate?: Date | null;
	endDate?: Date | null;
	onChange: (dates: [Date | null, Date | null]) => void;
	disabledDates?: Date[];
	className?: string;
}

export function DateTimeRangePicker({
	startDate,
	endDate,
	onChange,
	disabledDates,
	className,
}: DateTimeRangePickerProps) {
	return (
		<div className={cn("relative", className)}>
			<DatePicker
				locale="ru"
				selectsRange={true}
				startDate={startDate || null}
				endDate={endDate || null}
				onChange={(update) => onChange(update as [Date | null, Date | null])}
				// Config for time selection
				showTimeSelect
				timeFormat="HH:mm"
				timeIntervals={1} // interval in minutes
				timeCaption="Время"
				dateFormat="dd.MM.yyyy HH:mm"
				// Excludes past dates
				minDate={new Date()}
				excludeDates={disabledDates || []}
				customInput={
					<Button
						variant="outline"
						className="w-full justify-start text-left font-normal"
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{startDate
							? endDate
								? `${startDate.toLocaleString("ru")} - ${endDate.toLocaleString("ru")}`
								: startDate.toLocaleString("ru")
							: "Выберите даты и время"}
					</Button>
				}
			/>
		</div>
	);
}
