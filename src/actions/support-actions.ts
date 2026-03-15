import {
	SUPPORT_ADDRESS_DEFAULT,
	SUPPORT_PHONE_DEFAULT,
	SUPPORT_TELEGRAM_DEFAULT,
	type SupportInfo,
} from "@/constants";

export async function getSupportInfo(): Promise<SupportInfo> {
	const { createClient } = await import("@/lib/supabase/server");
	const supabase = await createClient();

	const { data } = await supabase
		.from("site_settings")
		.select("key, value")
		.in("key", ["support_phone", "support_telegram", "support_address"]);

	const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));

	return {
		phone: map.support_phone ?? SUPPORT_PHONE_DEFAULT,
		telegram: map.support_telegram ?? SUPPORT_TELEGRAM_DEFAULT,
		address: map.support_address ?? SUPPORT_ADDRESS_DEFAULT,
	};
}

export async function updateSupportInfoAction(
	patch: Partial<SupportInfo>
): Promise<{ success: boolean; error?: string }> {
	"use server";
	const { createClient } = await import("@/lib/supabase/server");
	const { revalidatePath } = await import("next/cache");
	const supabase = await createClient();

	const mapping: Record<keyof SupportInfo, string> = {
		phone: "support_phone",
		telegram: "support_telegram",
		address: "support_address",
	};

	const rows = (Object.keys(patch) as (keyof SupportInfo)[])
		.filter((k) => patch[k] !== undefined)
		.map((k) => ({ key: mapping[k], value: patch[k] as string }));

	if (rows.length === 0) return { success: true };

	const { error } = await supabase
		.from("site_settings")
		.upsert(rows, { onConflict: "key" });

	if (error) return { success: false, error: error.message };

	revalidatePath("/", "layout");
	return { success: true };
}
