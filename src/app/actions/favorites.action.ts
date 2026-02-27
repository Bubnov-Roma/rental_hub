"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function toggleFavoriteAction(
	equipmentId: string
): Promise<{ isFavorite: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return { isFavorite: false, error: "Unauthorized" };

	const { data: existing } = await supabase
		.from("favorites")
		.select("id")
		.eq("user_id", user.id)
		.eq("equipment_id", equipmentId)
		.maybeSingle();

	if (existing) {
		await supabase.from("favorites").delete().eq("id", existing.id);
		revalidatePath("/favorites");
		return { isFavorite: false };
	}

	const { error } = await supabase.from("favorites").insert({
		user_id: user.id,
		equipment_id: equipmentId,
	});

	if (error) return { isFavorite: false, error: error.message };
	revalidatePath("/favorites");
	return { isFavorite: true };
}

export async function checkFavoriteAction(
	equipmentId: string
): Promise<boolean> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return false;

	const { data } = await supabase
		.from("favorites")
		.select("id")
		.eq("user_id", user.id)
		.eq("equipment_id", equipmentId)
		.maybeSingle();

	return !!data;
}

// ─── Equipment Sets ───────────────────────────────────────────────────────────

interface SetItem {
	equipment_id: string;
	quantity: number;
}

interface SaveSetInput {
	id?: string; // undefined → INSERT, string → UPDATE
	name: string;
	description: string;
	items: SetItem[];
	total_price_per_day: number;
}

/**
 * Save (create or update) an equipment set.
 *
 * WHY a server action?
 * The client-side supabase `insert` into equipment_sets was failing because:
 *   1. The table has `user_id uuid NOT NULL` with an FK to auth.users
 *   2. RLS policies require the row's user_id to match auth.uid()
 *   3. When using the anon/public client without passing user_id explicitly,
 *      the insert violates the NOT NULL constraint → Supabase returns an error
 *      and the client hangs (toast never fires because error is swallowed)
 *
 * The server action uses the server-side Supabase client which reads the
 * session cookie, extracts the authenticated user, and supplies user_id
 * from the server — eliminating both issues.
 */
export async function saveSetAction(
	data: SaveSetInput
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return { success: false, error: "Unauthorized" };

	if (data.id) {
		// UPDATE — scoped to this user's set only
		const { error } = await supabase
			.from("equipment_sets")
			.update({
				name: data.name,
				description: data.description,
				items: data.items,
				total_price_per_day: data.total_price_per_day,
				updated_at: new Date().toISOString(),
			})
			.eq("id", data.id)
			.eq("user_id", user.id); // own-row check

		if (error) {
			console.error("[saveSetAction] update error:", error);
			return { success: false, error: error.message };
		}
	} else {
		// INSERT — user_id injected from session, never from client payload
		const { error } = await supabase.from("equipment_sets").insert({
			user_id: user.id,
			name: data.name,
			description: data.description,
			items: data.items,
			total_price_per_day: data.total_price_per_day,
		});

		if (error) {
			console.error("[saveSetAction] insert error:", error);
			return { success: false, error: error.message };
		}
	}

	revalidatePath("/favorites");
	return { success: true };
}
