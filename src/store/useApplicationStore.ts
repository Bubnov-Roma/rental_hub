import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import type { ClientFormValues } from "@/schemas";
import type { ApplicationStatus } from "@/types";

interface ApplicationState {
	status: ApplicationStatus;
	applicationData: ClientFormValues | null;

	// Черновик формы — сохраняется в localStorage при каждом изменении
	formDraft: Partial<ClientFormValues> | null;

	setInitialState: (
		status: ApplicationStatus,
		data: ClientFormValues | null
	) => void;
	setFormDraft: (draft: Partial<ClientFormValues>) => void;
	clearFormDraft: () => void;
	subscribe: (userId: string) => () => void;
	submitSuccess: (data: ClientFormValues) => void;
}

const supabase = createClient();

export const useApplicationStore = create<ApplicationState>()(
	persist(
		(set) => ({
			status: "loading",
			applicationData: null,
			formDraft: null,

			setInitialState: (status, data) => set({ status, applicationData: data }),

			setFormDraft: (draft) => set({ formDraft: draft }),

			clearFormDraft: () => set({ formDraft: null }),

			submitSuccess: (data: ClientFormValues) =>
				set({
					status: "pending",
					applicationData: data,
					formDraft: null,
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
								status: payload.new.status,
								applicationData: payload.new.application_data,
							});
						}
					)
					.subscribe();

				return () => {
					supabase.removeChannel(channel);
				};
			},
		}),
		{
			name: "linza-application-store",
			storage: createJSONStorage(() => localStorage),
			// Персистируем только черновик формы — статус всегда берём с сервера
			partialize: (state) => ({
				formDraft: state.formDraft,
			}),
		}
	)
);
