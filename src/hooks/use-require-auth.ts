"use client";

import { useAuth } from "@/hooks/use-auth";
import type { AuthModalIntent } from "@/store/auth-modal.store";
import { useAuthModalStore } from "@/store/auth-modal.store";

export function useRequireAuth() {
	const { user } = useAuth();
	const { open } = useAuthModalStore();

	return function requireAuth(action: () => void, intent?: AuthModalIntent) {
		if (user) {
			action();
		} else {
			open(intent ?? { type: "callback", fn: action });
		}
	};
}
