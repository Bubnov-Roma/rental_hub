import { create } from "zustand";

interface UnsavedChangesStore {
	isDirty: boolean;
	setDirty: (value: boolean) => void;
}

export const useUnsavedChanges = create<UnsavedChangesStore>((set) => ({
	isDirty: false,
	setDirty: (value) => set({ isDirty: value }),
}));
