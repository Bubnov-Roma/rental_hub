"use client";

import { useEffect, useRef } from "react";
import { useApplicationStore } from "@/store/use-application-store";
import type { ClientApplication } from "@/types";

export function ApplicationInitializer({
	userId,
	initialData,
	children,
}: {
	userId: string | null;
	initialData: ClientApplication | null;
	children: React.ReactNode;
}) {
	const { setInitialState, subscribe } = useApplicationStore();
	const isInitialized = useRef(false);

	if (!isInitialized.current) {
		setInitialState(
			initialData?.status || "NO_APPLICATION",
			initialData?.applicationData || null
		);
		isInitialized.current = true;
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <initialize user>
	useEffect(() => {
		if (!userId) return;
		const unsubscribe = subscribe(userId);
		return () => unsubscribe();
	}, [userId]);

	return <>{children}</>;
}
