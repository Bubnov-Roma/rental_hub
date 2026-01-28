"use client";

import { type FieldPath, useFormContext, useWatch } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { FormFieldWrapper } from "@/components/forms/shared/FormFieldWrapper";
import type { CornerRounding } from "@/components/ui";
import type { ClientFormValues } from "@/schemas";
import { cn, getBorderClasses, getRoundingClasses } from "@/utils";

interface DateInputProps {
	name: FieldPath<ClientFormValues>;
	label?: string;
	className?: string;
	disabled?: boolean;
	corners?: CornerRounding;
	standalone?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
	required?: boolean;
}

export const DateInput = ({
	name,
	label,
	className,
	disabled,
	corners,
	standalone = true,
	onFocus,
	onBlur,
	required = false,
}: DateInputProps) => {
	const { register, setValue, formState, control } =
		useFormContext<ClientFormValues>();

	const currentValue = useWatch({ name, control, defaultValue: "" }) as string;

	const { error } = control.getFieldState(name, formState);
	const { ref, ...restRegister } = register(name);

	const inputElement = (
		<PatternFormat
			{...restRegister}
			getInputRef={ref}
			format="##.##.####"
			mask="_"
			value={currentValue}
			placeholder="ДД.ММ.ГГГГ"
			disabled={disabled}
			onFocus={onFocus}
			onBlur={onBlur}
			onValueChange={(values) => {
				setValue(name, values.formattedValue, {
					shouldValidate: true,
				});
			}}
			className={cn(
				"h-11 w-full min-w-0 rounded-xl px-4 py-2 text-base transition-all outline-none",
				"glass-input",
				"disabled:opacity-20 disabled:cursor-not-allowed",
				"md:text-sm",
				getRoundingClasses(corners),
				getBorderClasses(corners),
				error && "border-red-400/50",
				className
			)}
		/>
	);

	if (!standalone) {
		return inputElement;
	}

	return (
		<FormFieldWrapper
			required={required}
			label={label || "Дата"}
			error={error?.message ?? ""}
			id={`field-${name}`}
		>
			{inputElement}
		</FormFieldWrapper>
	);
};
