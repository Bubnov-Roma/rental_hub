"use client";
import { type FieldPath, useFormContext, useWatch } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { FormFieldWrapper } from "@/components/forms/shared/FormFieldWrapper";
import { cn } from "@/lib/utils";
import type { ClientFormValues } from "@/schemas";
import type {
	CornerRounding,
	InputGroupOrientation,
	InputPosition,
} from "@/types";
import { getBorderClasses, getRoundingClasses } from "@/utils";

interface PhoneInputProps {
	name: FieldPath<ClientFormValues>;
	label?: string;
	className?: string;
	disabled?: boolean;
	corners?: CornerRounding;
	orientation?: InputGroupOrientation;
	position?: InputPosition;
	standalone?: boolean; //**  true = wrapper, false = only input */
	onFocus?: () => void;
	onBlur?: () => void;
	required?: boolean;
}

export const PhoneInput = ({
	name,
	label,
	className,
	disabled,
	corners,
	standalone = true,
	onFocus,
	onBlur,
	required = false,
}: PhoneInputProps) => {
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
			format="+7(###)###-##-##"
			mask="_"
			allowEmptyFormatting={false}
			placeholder="+7(###)###-##-##"
			disabled={disabled}
			onFocus={onFocus}
			onBlur={onBlur}
			onValueChange={(values) => {
				setValue(name, values.formattedValue, {
					shouldValidate: true,
				});
			}}
			className={cn(
				"h-11 w-full min-w-0 px-4 py-2 text-base transition-all outline-none",
				"disabled:opacity-20 disabled:cursor-not-allowed",
				"md:text-sm",
				corners ? getRoundingClasses(corners) : "rounded-md",
				corners && getBorderClasses(corners),
				corners ? "glass-input-neumorphic" : "glass-input",
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
			label={label || "Телефон"}
			error={error?.message ?? ""}
			id={`field-${name}`}
		>
			{inputElement}
		</FormFieldWrapper>
	);
};
