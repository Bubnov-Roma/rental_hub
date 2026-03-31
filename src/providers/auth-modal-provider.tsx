"use client";

import { AuthModal } from "@/components/shared";
import { useAuthModalStore } from "@/store/auth-modal.store";

export function AuthModalProvider() {
	const { isOpen, intent, close } = useAuthModalStore();

	return (
		<AuthModal
			open={isOpen}
			onOpenChange={(v) => {
				if (!v) close();
			}}
			intent={intent}
		/>
	);
}
