"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction() {
	const supabase = await createClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		throw new Error("Ошибка при выходе из системы");
	}

	await supabase.auth.signOut();

	revalidatePath("/", "layout");
	redirect("/");
}
