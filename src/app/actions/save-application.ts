"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getErrorMessage } from "@/utils";

export async function submitApplicationAction(formData: FormData) {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return { success: false, error: "Unauthorized" };

		const { error } = await supabase.rpc("submit_client_application", {
			_user_id: user.id,
			_client_type: formData.get("clientType"),
			_application_data: formData,
		});

		if (error) {
			console.error("RPC Error:", error);
			return { success: false, error: error.message };
		}

		revalidatePath("/dashboard/profile");
		return { success: true };
	} catch (e) {
		return { success: false, error: getErrorMessage(e) || "Server error" };
	}
}
