import { useCallback, useState } from "react";

// Hook for managing dynamic form fields
export function useDynamicFields<T extends { url: string }>(
	initialFields: T[] = [],
	validationFn?: (field: T) => boolean
) {
	const [fields, setFields] = useState<T[]>(initialFields);

	const addField = useCallback((field: T) => {
		setFields((prev) => [...prev, field]);
	}, []);

	const removeField = useCallback((index: number) => {
		setFields((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const updateField = useCallback((index: number, field: T) => {
		setFields((prev) => prev.map((f, i) => (i === index ? field : f)));
	}, []);

	const validateAll = useCallback(() => {
		if (!validationFn) return true;
		return fields.every(validationFn);
	}, [fields, validationFn]);

	return {
		fields,
		addField,
		removeField,
		updateField,
		validateAll,
		setFields,
	};
}

// Hook for handling errors in forms and other components
export function useErrorHandler() {
	const [error, setError] = useState<string>("");

	const handleError = useCallback((err: unknown, defaultMessage?: string) => {
		if (err instanceof Error) {
			setError(err.message);
		} else if (typeof err === "string") {
			setError(err);
		} else if (err && typeof err === "object" && "message" in err) {
			setError(String((err as { message: unknown }).message));
		} else {
			setError(defaultMessage || "Произошла неизвестная ошибка");
		}
	}, []);

	const clearError = useCallback(() => {
		setError("");
	}, []);

	return { error, handleError, clearError, setError };
}

// Function to mask sensitive data in form submissions
export function maskSensitiveData(
	data: Record<string, unknown>
): Record<string, unknown> {
	const masked = { ...data };

	const sensitiveFields = [
		"password",
		"confirmPassword",
		"passport",
		"series",
		"number",
		"departmentCode",
		"salary",
		"phone",
	];

	sensitiveFields.forEach((field) => {
		if (field in masked) {
			if (typeof masked[field] === "string") {
				masked[field] = "***";
			}
		}
	});

	return masked;
}
