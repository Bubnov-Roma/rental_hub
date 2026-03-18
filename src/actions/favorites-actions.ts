"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavoriteAction(
	equipmentId: string
): Promise<{ isFavorite: boolean; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) return { isFavorite: false, error: "Unauthorized" };

		const existing = await prisma.favorite.findFirst({
			where: { userId: session.user.id, equipmentId },
		});

		if (existing) {
			await prisma.favorite.delete({ where: { id: existing.id } });
			revalidatePath("/favorites");
			return { isFavorite: false };
		}

		await prisma.favorite.create({
			data: { userId: session.user.id, equipmentId },
		});

		revalidatePath("/favorites");
		return { isFavorite: true };
	} catch (error: unknown) {
		if (error instanceof Error)
			return { isFavorite: false, error: error.message };
		return { isFavorite: false, error: "Ошибка" };
	}
}

export async function checkFavoriteAction(
	equipmentId: string
): Promise<boolean> {
	try {
		const session = await auth();
		if (!session?.user?.id) return false;

		const existing = await prisma.favorite.findFirst({
			where: { userId: session.user.id, equipmentId },
		});

		return !!existing;
	} catch {
		return false;
	}
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
	try {
		const session = await auth();
		if (!session?.user?.id) return { success: false, error: "Unauthorized" };

		if (data.id) {
			await prisma.equipmentSet.updateMany({
				where: { id: data.id, userId: session.user.id },
				data: {
					name: data.name,
					description: data.description,
					items: data.items as unknown as Prisma.InputJsonArray,
					totalPricePerDay: data.total_price_per_day,
				},
			});
		} else {
			await prisma.equipmentSet.create({
				data: {
					userId: session.user.id,
					name: data.name,
					description: data.description,
					items: data.items as unknown as Prisma.InputJsonArray,
					totalPricePerDay: data.total_price_per_day,
				},
			});
		}

		revalidatePath("/favorites");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Ошибка сохранения сета" };
	}
}
