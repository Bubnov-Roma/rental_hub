import { useMemo } from "react";
import type { FieldPath, FieldValues } from "react-hook-form";
import { isFieldRequired } from "@/utils";

export function useFieldRequired(fieldPath: FieldPath<FieldValues>): boolean {
	return useMemo(() => {
		return isFieldRequired(fieldPath);
	}, [fieldPath]);
}
