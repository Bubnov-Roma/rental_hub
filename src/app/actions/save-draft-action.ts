"use server";

import { createClient } from "@/lib/supabase/server";
import type { ClientFormValues } from "@/schemas";

export async function saveDraftAction(
	data: Partial<ClientFormValues>
): Promise<{ success: boolean; error?: string }> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return { success: false, error: "Unauthorized" };

		await supabase
			.from("profiles")
			.upsert(
				{ id: user.id, email: user.email },
				{ onConflict: "id", ignoreDuplicates: true }
			);

		const { error } = await supabase.from("client_applications").upsert(
			{
				user_id: user.id,
				client_type: data.clientType ?? "individual",
				application_data: data,
				status: "draft",
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "user_id" }
		);

		if (error) {
			// Row exists with non-draft status — only patch data, keep status
			const { error: patchErr } = await supabase
				.from("client_applications")
				.update({
					application_data: data,
					updated_at: new Date().toISOString(),
				})
				.eq("user_id", user.id)
				.eq("status", "draft");

			if (patchErr) return { success: false, error: patchErr.message };
		}

		return { success: true };
	} catch (err) {
		console.error("saveDraftAction:", err);
		return { success: false, error: "Server error" };
	}
}

export async function loadDraftAction(): Promise<{
	data: Partial<ClientFormValues> | null;
	status: string | null;
}> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return { data: null, status: null };

		const { data } = await supabase
			.from("client_applications")
			.select("application_data, status")
			.eq("user_id", user.id)
			.maybeSingle();

		return {
			data: (data?.application_data as Partial<ClientFormValues>) ?? null,
			status: data?.status ?? null,
		};
	} catch {
		return { data: null, status: null };
	}
}
