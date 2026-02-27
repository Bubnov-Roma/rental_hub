"use client";

import { useEffect, useRef } from "react";
import { useApplicationStore } from "@/store/use-application-store";
import type { ClientApplication } from "@/types";

export function ApplicationInitializer({
	userId,
	initialData,
	children,
}: {
	userId: string;
	initialData: ClientApplication;
	children: React.ReactNode;
}) {
	const { setInitialState, subscribe } = useApplicationStore();
	const isInitialized = useRef(false);

	const initialDataRef = useRef(initialData);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <initialize user>
	useEffect(() => {
		if (!isInitialized.current) {
			setInitialState(
				initialDataRef.current?.status || "no_application",
				initialDataRef.current?.application_data || null
			);
			isInitialized.current = true;
		}
		if (userId) {
			const unsubscribe = subscribe(userId);
			return () => unsubscribe();
		}
		return undefined;
	}, [userId]);

	return <>{children}</>;
}
