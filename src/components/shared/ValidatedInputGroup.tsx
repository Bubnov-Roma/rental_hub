"use client";

import React from "react";
import { FormFieldWrapper } from "@/components/forms/shared/FormFieldWrapper";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface ValidatedInputGroupProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: string;
	leftAddon?: React.ReactNode;
	rightAddon?: React.ReactNode;
	wrapperClassName?: string;
}

export const ValidatedInputGroup = React.forwardRef<
	HTMLInputElement,
	ValidatedInputGroupProps
>(
	(
		{
			label,
			error,
			leftAddon,
			rightAddon,
			className,
			wrapperClassName,
			...props
		},
		ref
	) => {
		return (
			<FormFieldWrapper
				label={label ?? ""}
				error={error ?? ""}
				className={wrapperClassName ?? ""}
				id={`field-${props.name || props.id}`}
				required={props.required ?? false}
			>
				<InputGroup error={!!error}>
					{leftAddon && (
						<InputGroupAddon align="inline-start">{leftAddon}</InputGroupAddon>
					)}

					<InputGroupInput
						ref={ref}
						{...props}
						className={cn("h-full", className)}
					/>
					{rightAddon && (
						<InputGroupAddon align="inline-end">{rightAddon}</InputGroupAddon>
					)}
				</InputGroup>
			</FormFieldWrapper>
		);
	}
);

ValidatedInputGroup.displayName = "ValidatedInputGroup";
