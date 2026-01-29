"use client";

import { useEffect, useRef } from "react";
import { useApplicationStore } from "@/store/useApplicationStore";
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

	useEffect(() => {
		if (!isInitialized.current) {
			setInitialState(
				initialData?.status || "no_application",
				initialData?.application_data || null
			);
			isInitialized.current = true;
		}
		if (userId) {
			const unsubscribe = subscribe(userId);
			return () => unsubscribe();
		}
		return undefined;
	}, [userId, initialData, setInitialState, subscribe]);

	return <>{children}</>;
}
