"use server";

import { revalidatePath } from "next/cache";
import {
	SUPPORT_ADDRESS_DEFAULT,
	SUPPORT_PHONE_DEFAULT,
	SUPPORT_TELEGRAM_DEFAULT,
	type SupportInfo,
} from "@/constants";
import { prisma } from "@/lib/prisma";

export async function getSupportInfo(): Promise<SupportInfo> {
	const data = await prisma.siteSetting.findMany({
		where: {
			key: { in: ["support_phone", "support_telegram", "support_address"] },
		},
		select: { key: true, value: true },
	});

	const map = Object.fromEntries(data.map((r) => [r.key, r.value]));

	return {
		phone: map.support_phone ?? SUPPORT_PHONE_DEFAULT,
		telegram: map.support_telegram ?? SUPPORT_TELEGRAM_DEFAULT,
		address: map.support_address ?? SUPPORT_ADDRESS_DEFAULT,
	};
}

export async function updateSupportInfoAction(
	patch: Partial<SupportInfo>
): Promise<{ success: boolean; error?: string }> {
	try {
		const mapping: Record<keyof SupportInfo, string> = {
			phone: "support_phone",
			telegram: "support_telegram",
			address: "support_address",
		};

		const promises = (Object.keys(patch) as (keyof SupportInfo)[])
			.filter((k) => patch[k] !== undefined)
			.map((k) =>
				prisma.siteSetting.upsert({
					where: { key: mapping[k] },
					update: { value: patch[k] as string },
					create: { key: mapping[k], value: patch[k] as string },
				})
			);

		if (promises.length === 0) return { success: true };

		await prisma.$transaction(promises);

		revalidatePath("/", "layout");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Ошибка обновления" };
	}
}
