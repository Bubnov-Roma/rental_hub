"use client";

import { type FieldPath, useFormContext, useWatch } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { FormFieldWrapper } from "@/components/forms/shared/FormFieldWrapper";
import { cn } from "@/lib/utils";
import type { ClientFormValues } from "@/schemas";

interface PassportInputProps {
	name: FieldPath<ClientFormValues>;
	label: string;
	className?: string;
	disabled?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
	required?: boolean;
}

export const PassportInput = ({
	name,
	label,
	className,
	disabled,
	onFocus,
	onBlur,
	required = false,
}: PassportInputProps) => {
	const { register, setValue, formState, control } =
		useFormContext<ClientFormValues>();
	const currentValue = useWatch({
		control,
		name,
		defaultValue: "",
	}) as string;

	const { error } = control.getFieldState(name, formState);
	const { ref, ...restRegister } = register(name);

	const inputElement = (
		<PatternFormat
			{...restRegister}
			getInputRef={ref}
			value={currentValue}
			format="#### ######"
			allowEmptyFormatting={false}
			mask="_"
			placeholder="#### ######"
			disabled={disabled}
			onFocus={onFocus}
			onBlur={onBlur}
			onValueChange={(values) => {
				setValue(name, values.formattedValue, {
					shouldValidate: true,
				});
			}}
			className={cn(
				"h-11 w-full min-w-0 rounded-md px-4 py-2 text-base transition-all outline-none",
				"glass-input",
				"disabled:opacity-20 disabled:cursor-not-allowed",
				"md:text-sm",
				error && "border-red-400/50",
				className
			)}
		/>
	);
	return (
		<FormFieldWrapper
			required={required}
			label={label || "Серия и номер"}
			error={error?.message ?? ""}
			id={`field-${name}`}
		>
			{inputElement}
		</FormFieldWrapper>
	);
};
