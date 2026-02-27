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
	standalone?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
	required?: boolean;
}

/**
 * Normalize any phone string to 10 digits so PatternFormat can fill
 * +7(###)###-##-## cleanly.
 *
 * Handles:
 *   "9025810525"          → "9025810525"   (already clean)
 *   "+79025810525"        → "9025810525"
 *   "89025810525"         → "9025810525"
 *   "(902)581-05-25"      → "9025810525"   (browser autofill without +7)
 *   "+7 (902) 581-05-25"  → "9025810525"
 *   "7(902)581-05-25"     → "9025810525"
 */
function normalizePhone(raw: string): string {
	// Strip everything except digits
	const digits = raw.replace(/\D/g, "");

	if (!digits) return "";

	// 11 digits starting with 7 or 8 → strip leading digit
	if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) {
		return digits.slice(1);
	}

	// 10 digits → already the local part
	if (digits.length === 10) {
		return digits;
	}

	// Anything else → return as-is (PatternFormat will mask it)
	return digits;
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

	// PatternFormat expects the raw digits (without the +7 prefix) OR the full
	// formatted value "+7(XXX)XXX-XX-XX". We store the *formatted* value in RHF
	// and feed it back directly — PatternFormat handles it fine. On autofill we
	// normalise first.
	const handleChange = (raw: string, formatted: string) => {
		// If the value coming in looks like an autofilled raw phone, normalise it
		const needsNorm =
			!formatted.startsWith("+7") && raw.replace(/\D/g, "").length > 0;

		if (needsNorm) {
			const local = normalizePhone(raw);
			// Re-derive the formatted string PatternFormat would produce
			const padded = local.padEnd(10, "_");
			const f = `+7(${padded.slice(0, 3)})${padded.slice(3, 6)}-${padded.slice(6, 8)}-${padded.slice(8, 10)}`;
			setValue(name, f, { shouldValidate: true });
		} else {
			setValue(name, formatted, { shouldValidate: true });
		}
	};

	const inputElement = (
		<PatternFormat
			{...restRegister}
			getInputRef={ref}
			value={currentValue}
			format="+7(###)###-##-##"
			mask="_"
			allowEmptyFormatting={false}
			placeholder="+7(___) ___-__-__"
			disabled={disabled}
			onFocus={onFocus}
			onBlur={onBlur}
			onValueChange={(values) => {
				handleChange(values.value, values.formattedValue);
			}}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
				const raw = e.target.value;
				if (!raw.startsWith("+7")) {
					const local = normalizePhone(raw);
					if (local) {
						const padded = local.padEnd(10, "_");
						const f = `+7(${padded.slice(0, 3)})${padded.slice(3, 6)}-${padded.slice(6, 8)}-${padded.slice(8, 10)}`;
						setValue(name, f, { shouldValidate: true });
					}
				}
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

	if (!standalone) return inputElement;

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
