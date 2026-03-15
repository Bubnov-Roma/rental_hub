"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
	id?: string;
	name: string;
	description: string;
	items: SetItem[];
	total_price_per_day: number;
}

export async function saveSetAction(
	data: SaveSetInput
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return { success: false, error: "Unauthorized" };

	if (data.id) {
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
			.eq("user_id", user.id);

		if (error) {
			console.error("[saveSetAction] update error:", error);
			return { success: false, error: error.message };
		}
	} else {
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
