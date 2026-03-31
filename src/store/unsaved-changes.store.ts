/**
 * use-unsaved-changes.ts
 *
 * Global store that tracks whether any admin form has unsaved changes.
 * - Set isDirty = true when a form is modified
 * - Set isDirty = false on save or cancel
 * - UnsavedChangesGuard (already in RootProvider) listens to isDirty
 *   and shows a browser "Leave site?" dialog on beforeunload.
 *
 * Usage in a form component:
 *
 *   const markDirty   = useUnsavedChanges((s) => s.markDirty);
 *   const markClean   = useUnsavedChanges((s) => s.markClean);
 *
 *   On any field change:
 *   <Input onChange={(e) => { markDirty(); setTitle(e.target.value); }} />
 *
 *   On save/cancel:
 *   markClean();
 *
 * Or use the convenience hook useFormDirtyGuard() below.
 */

import { create } from "zustand";

interface UnsavedChangesState {
	isDirty: boolean;
	markDirty: () => void;
	markClean: () => void;
}

export const useUnsavedChanges = create<UnsavedChangesState>()((set) => ({
	isDirty: false,
	markDirty: () => set({ isDirty: true }),
	markClean: () => set({ isDirty: false }),
}));

export function useFormDirtyGuard() {
	const markDirty = useUnsavedChanges((s) => s.markDirty);
	const markClean = useUnsavedChanges((s) => s.markClean);

	function wrap<T extends (...args: unknown[]) => unknown>(fn: T): T {
		return ((...args: unknown[]) => {
			markDirty();
			return fn(...args);
		}) as T;
	}

	return { wrap, reset: markClean, markDirty, markClean };
}
