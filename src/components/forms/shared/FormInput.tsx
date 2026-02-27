"use client";

import { type FieldPath, useFormContext } from "react-hook-form";
import { ValidatedInput } from "@/components/forms/shared/ValidatedInput";
import type { ClientFormValues } from "@/schemas";

interface FormInputProps {
	name: FieldPath<ClientFormValues>;
	label: string;
	formatter?: (value: string) => string;
	placeholder?: string;
	type?: string;
	className?: string;
	required?: boolean;
	disabled?: boolean;
}

export const FormInput = ({
	name,
	label,
	formatter,
	className,
	required = false,
	disabled = false,
	...props
}: FormInputProps) => {
	const { register, setValue, formState, control } =
		useFormContext<ClientFormValues>();

	const { error } = control.getFieldState(name, formState);
	const { ref, onChange, onBlur, ...restRegister } = register(name);

	return (
		<ValidatedInput
			{...props}
			{...restRegister}
			ref={ref}
			label={label}
			required={required}
			className={className}
			disabled={disabled}
			error={error?.message ?? ""}
			onBlur={onBlur}
			onChange={(e) => {
				const val = formatter ? formatter(e.target.value) : e.target.value;
				onChange(e);
				setValue(name, val as never, {
					shouldValidate: true,
					shouldDirty: true,
					shouldTouch: true,
				});
			}}
		/>
	);
};
