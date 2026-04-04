import { create } from "zustand";

interface SiteSettingsState {
	workStart: number;
	workEnd: number;
	disabledDates: string[];
	setSettings: (settings: Partial<SiteSettingsState>) => void;
}

export const useSiteSettingsStore = create<SiteSettingsState>((set) => ({
	workStart: 10,
	workEnd: 20,
	disabledDates: [],
	setSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));
