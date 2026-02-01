import React from "react";
import { FormFieldWrapper } from "@/components/forms/shared/FormFieldWrapper";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ValidatedInputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
	placeholder?: string;
	name?: string;
}

export const ValidatedInput = React.forwardRef<
	HTMLInputElement,
	ValidatedInputProps
>(
	(
		{
			placeholder,
			label,
			error,
			required = false,
			name = "",
			onKeyDown,
			className,
			...props
		},
		ref
	) => {
		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				const form = e.currentTarget.form;
				if (form) {
					form.requestSubmit();
				}
			}
			onKeyDown?.(e);
		};

		return (
			<FormFieldWrapper
				label={label}
				required={required}
				error={error ?? ""}
				id={`field-${label}`}
			>
				<Input
					ref={ref}
					{...props}
					placeholder={placeholder}
					onKeyDown={handleKeyDown}
					className={cn(className, error && "border-red-400/50")}
				/>
			</FormFieldWrapper>
		);
	}
);

ValidatedInput.displayName = "ValidatedInput";
