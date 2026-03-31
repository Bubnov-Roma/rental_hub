import { create } from "zustand";

export type AuthModalIntent =
	| { type: "auth" } // просто войти, потом закрыть
	| { type: "booking"; equipmentId?: string } // войти → к оформлению
	| { type: "redirect"; url: string } // войти → перейти на url
	| { type: "callback"; fn: () => void }; // войти → вызвать функцию

interface AuthModalState {
	isOpen: boolean;
	intent: AuthModalIntent;
	open: (intent?: AuthModalIntent) => void;
	close: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
	isOpen: false,
	intent: { type: "auth" },
	open: (intent = { type: "auth" }) => set({ isOpen: true, intent }),
	close: () => set({ isOpen: false }),
}));

export const openAuthModal = (intent?: AuthModalIntent) =>
	useAuthModalStore.getState().open(intent);
