"use client";

import { useCallback, useState } from "react";
import type z from "zod";
import { clientFormSchema } from "@/schemas/client.schema";

type ZodTypeName =
	| "ZodObject"
	| "ZodArray"
	| "ZodOptional"
	| "ZodNullable"
	| "ZodDefault"
	| "ZodLiteral"
	| "ZodDiscriminatedUnion"
	| "ZodString"
	| "ZodNumber"
	| "ZodBoolean"
	| "ZodEffects";

interface ZodDef {
	typeName: ZodTypeName;
	[key: string]: unknown;
}

interface ZodSchema {
	_def: ZodDef;
	isOptional: () => boolean;
}

interface ZodObjectDef extends ZodDef {
	typeName: "ZodObject";
	shape: () => Record<string, ZodSchema>;
}

interface ZodDiscriminatedUnionDef extends ZodDef {
	typeName: "ZodDiscriminatedUnion";
	options: ZodSchema[];
}

interface ZodOptionalDef extends ZodDef {
	typeName: "ZodOptional";
	innerType: ZodSchema;
}

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

function isZodObject(
	schema: ZodSchema
): schema is ZodSchema & { _def: ZodObjectDef } {
	return schema._def.typeName === "ZodObject";
}

function isZodDiscriminatedUnion(
	schema: ZodSchema
): schema is ZodSchema & { _def: ZodDiscriminatedUnionDef } {
	return schema._def.typeName === "ZodDiscriminatedUnion";
}

function isZodOptional(
	schema: ZodSchema
): schema is ZodSchema & { _def: ZodOptionalDef } {
	return schema._def.typeName === "ZodOptional";
}

function isZodLiteral(schema: ZodSchema): boolean {
	return schema._def.typeName === "ZodLiteral";
}

export function isFieldRequired(
	fieldPath: string,
	schema: z.ZodTypeAny = clientFormSchema
): boolean {
	try {
		const parts = fieldPath.split(".");
		let currentSchema: ZodSchema = schema as unknown as ZodSchema;

		for (const part of parts) {
			if (isZodDiscriminatedUnion(currentSchema)) {
				const options = currentSchema._def.options;
				if (options.length === 0) return false;
				currentSchema = options[0] as ZodSchema;
			}

			if (isZodObject(currentSchema)) {
				const shape = currentSchema._def.shape();
				const nextSchema = shape[part];
				if (!nextSchema) {
					return false;
				}

				currentSchema = nextSchema as ZodSchema;
			}

			if (isZodOptional(currentSchema)) {
				return false;
			}

			if (isZodLiteral(currentSchema)) {
				continue;
			}

			if (!currentSchema) {
				return false;
			}
		}

		return !currentSchema.isOptional();
	} catch (error) {
		console.warn(
			`Could not determine if field "${fieldPath}" is required:`,
			error
		);
		return false;
	}
}
