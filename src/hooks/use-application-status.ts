"use client";

import { VERIFICATION_CONFIG } from "@/constants";
import { useApplicationStore } from "@/store";

export function useApplicationStatus() {
	const status = useApplicationStore((state) => state.status);
	const config = VERIFICATION_CONFIG[status] ?? VERIFICATION_CONFIG.loading;

	return { status, config };
}
