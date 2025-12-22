"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUnsavedChanges } from "@/state/use-unsaved-changes";

export function UnsavedChangesGuard() {
	const { user } = useAuth();
	const isDirty = useUnsavedChanges((state) => state.isDirty);

	useEffect(() => {
		if (!user) return;
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isDirty) {
				e.preventDefault();
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty, user]);

	return null;
}
