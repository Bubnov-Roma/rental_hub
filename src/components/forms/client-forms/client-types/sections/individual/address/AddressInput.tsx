"use client";

import { useState } from "react";
import { type FieldPath, useFormContext, useWatch } from "react-hook-form";
import { SuggestionsDropdown } from "@/components/forms/shared/SuggestionsDropdown";
import { ValidatedInput } from "@/components/forms/shared/ValidatedInput";
import { useDadataAddressSuggestions } from "@/hooks";
import type { ClientFormValues } from "@/schemas";
import type { DadataAddressSuggestion } from "@/services/dadata.service";
import type { AddressFieldPath } from "@/types";

interface AddressInputProps {
	name: FieldPath<ClientFormValues>;
	prefix: string;
	label: string;
	placeholder: string;
	required?: boolean;
}

export const AddressInput = ({
	name,
	prefix,
	label,
	placeholder,
	required = false,
}: AddressInputProps) => {
	const { register, setValue, control, formState } =
		useFormContext<ClientFormValues>();
	const [isOpen, setIsOpen] = useState(false);

	const query = useWatch({
		control,
		name,
		defaultValue: "",
	}) as string;
	const { suggestions, isLoading } = useDadataAddressSuggestions(query);

	const { error } = control.getFieldState(name, formState);

	const handleSelect = (suggestion: DadataAddressSuggestion) => {
		setValue(name, suggestion.value, {
			shouldValidate: true,
			shouldDirty: true,
		});

		const fields = {
			index: suggestion.data.postal_code ?? "",
			country: suggestion.data.country ?? "",
			region: suggestion.data.region_with_type ?? "",
			city:
				suggestion.data.city_with_type ??
				suggestion.data.settlement_with_type ??
				"",
		};

		Object.entries(fields).forEach(([key, val]) => {
			setValue(`${prefix}.${key}` as AddressFieldPath, val, {
				shouldValidate: true,
			});
		});
		setIsOpen(false);
	};

	return (
		<div className="relative w-full">
			<ValidatedInput
				required={required}
				label={label}
				{...register(name)}
				error={error?.message ?? ""}
				onFocus={() => setIsOpen(true)}
				onBlur={() => setTimeout(() => setIsOpen(false), 250)}
				autoComplete="off"
				placeholder={placeholder}
				onChange={(e) => {
					const val = e.target.value;
					setValue(name, val, { shouldValidate: true });
					if (val.length >= 2) {
						setIsOpen(true);
					} else {
						setIsOpen(false);
					}
				}}
			/>
			<SuggestionsDropdown
				isOpen={isOpen}
				suggestions={suggestions.map((s) => s.value)}
				onSelect={(val) => {
					const selected = suggestions.find((s) => s.value === val);
					if (selected) handleSelect(selected as DadataAddressSuggestion);
				}}
				isLoading={isLoading}
			/>
		</div>
	);
};
