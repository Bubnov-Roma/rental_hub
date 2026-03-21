import { create } from "zustand";
import type { ClientFormValues } from "@/schemas";
import type { ApplicationStatus } from "@/types";

interface ApplicationState {
	status: ApplicationStatus;
	applicationData: ClientFormValues | null;
	formDraft: Partial<ClientFormValues> | null;

	setInitialState: (
		status: ApplicationStatus,
		data: ClientFormValues | null
	) => void;
	setFormDraft: (draft: Partial<ClientFormValues>) => void;
	clearFormDraft: () => void;
	submitSuccess: (data: ClientFormValues) => void;
}

export const useApplicationStore = create<ApplicationState>()((set) => ({
	status: "LOADING",
	applicationData: null,
	formDraft: null,

	setInitialState: (status, data) => set({ status, applicationData: data }),

	setFormDraft: (draft) => set({ formDraft: draft }),

	clearFormDraft: () => set({ formDraft: null }),

	submitSuccess: (data: ClientFormValues) =>
		set({
			status: "PENDING",
			applicationData: data,
			formDraft: null,
		}),
}));
