"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface InlineEditFieldProps {
	/** Controlled value from parent (the "saved" value) */
	value: string;
	/** Called when user confirms the new value. Return a promise if async. */
	onSave: (value: string) => Promise<void> | void;
	/** Called when user cancels (X when value unchanged) */
	onCancel?: () => void;
	placeholder?: string;
	type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
	icon?: React.ReactNode;
	/** Extra classes on the wrapping InputGroup */
	className?: string;
	autoFocus?: boolean;
	/** Disable the field entirely */
	disabled?: boolean;
}

/**
 * InlineEditField
 *
 * Single-button behaviour:
 *   • No change from saved value → button shows  ✕ (cancel / close)
 *   • Value changed             → button shows  ✓ (save)
 *   • While saving              → spinner
 *
 * Enter = save (if dirty), Escape = cancel
 */
export function InlineEditField({
	value: savedValue,
	onSave,
	onCancel,
	placeholder,
	type = "text",
	icon,
	className,
	autoFocus = false,
	disabled = false,
}: InlineEditFieldProps) {
	const [draft, setDraft] = useState(savedValue);
	const [saving, setSaving] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// Sync if parent value changes (e.g. after successful save)
	useEffect(() => {
		setDraft(savedValue);
	}, [savedValue]);

	useEffect(() => {
		if (autoFocus) inputRef.current?.focus();
	}, [autoFocus]);

	const isDirty = draft !== savedValue;

	const handleSave = async () => {
		if (!isDirty || saving) return;
		setSaving(true);
		try {
			await onSave(draft);
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setDraft(savedValue);
		onCancel?.();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (isDirty) handleSave();
			else handleCancel();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			handleCancel();
		}
	};

	return (
		<InputGroup className={cn("h-10 group", className)} error={false}>
			{icon && <InputGroupAddon align="inline-start">{icon}</InputGroupAddon>}

			<InputGroupInput
				ref={inputRef}
				type={type}
				value={draft}
				placeholder={placeholder}
				disabled={disabled || saving}
				onChange={(e) => setDraft(e.target.value)}
				onKeyDown={handleKeyDown}
				className="text-sm"
			/>
			{(isDirty || saving) && (
				<InputGroupAddon align="inline-end" className="px-3">
					<InputGroupButton
						size="icon-sm"
						variant={isDirty ? "default" : "ghost"}
						disabled={saving}
						onClick={isDirty ? handleSave : handleCancel}
						className={cn(
							"transition-all opacity-70 group-hover:opacity-100",
							isDirty
								? "bg-primary text-primary-foreground hover:bg-primary/90 "
								: "text-muted-foreground hover:text-foreground"
						)}
						title={isDirty ? "Сохранить" : "Отмена"}
					>
						{saving ? (
							<span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
						) : (
							isDirty && <Check size={14} />
						)}
					</InputGroupButton>
				</InputGroupAddon>
			)}
		</InputGroup>
	);
}
