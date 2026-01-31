"use server";

import { createClient } from "@/lib/supabase/server";

export async function getApplicationStatusAction() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return { success: false, error: "Unauthorized" };

	const { data, error } = await supabase
		.from("client_applications")
		.select("status, rejection_reason")
		.eq("user_id", user.id)
		.single();

	if (error) return { success: false, error: error.message };

	return {
		success: true,
		status: data.status,
		rejectionReason: data.rejection_reason,
	};
}
