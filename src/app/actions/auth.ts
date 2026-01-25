"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		return { success: false, error: error.message };
	}

	revalidatePath("/", "layout");
	return { success: true };
}
