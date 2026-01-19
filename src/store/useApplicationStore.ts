import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { ClientFormValues } from "@/schemas";
import type { ApplicationStatus, VerificationStatus } from "@/types";

interface ApplicationState {
	status: ApplicationStatus;
	applicationData: ClientFormValues | null;
	setInitialState: (
		status: ApplicationStatus,
		data: ClientFormValues | null
	) => void;
	subscribe: (userId: string) => () => void;
	submitSuccess: (data: ClientFormValues) => void;
}

const supabase = createClient();

export const useApplicationStore = create<ApplicationState>((set) => ({
	status: "loading",
	applicationData: null,
	setInitialState: (status, data) => set({ status, applicationData: data }),
	submitSuccess: (data: ClientFormValues) =>
		set({
			status: "pending",
			applicationData: data,
		}),
	subscribe: (userId: string) => {
		if (!userId) return () => {};

		const channel = supabase
			.channel(`app-realtime-${userId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "client_applications",
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log("Realtime update received:", payload.new);
					set({
						status: payload.new.status as VerificationStatus,
						applicationData: payload.new.application_data,
					});
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	},
}));
