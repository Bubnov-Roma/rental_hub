"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type DbCartRow = {
	equipmentId: string;
	quantity: number;
};

// ── Получение корзины сервера ──
export async function fetchServerCartAction(): Promise<DbCartRow[]> {
	try {
		const session = await auth();
		if (!session?.user?.id) return [];

		const items = await prisma.cartItem.findMany({
			where: { userId: session.user.id },
			select: { equipmentId: true, quantity: true },
		});

		return items;
	} catch (error) {
		console.error("fetchServerCartAction error:", error);
		return [];
	}
}

// ── Добавление / Обновление (Upsert) ──
export async function upsertServerCartItemAction(
	equipmentId: string,
	quantity: number
): Promise<{ success: boolean; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) return { success: false, error: "Unauthorized" };

		await prisma.cartItem.upsert({
			where: {
				userId_equipmentId: {
					userId: session.user.id,
					equipmentId: equipmentId,
				},
			},
			update: {
				quantity: quantity,
				addedAt: new Date(),
			},
			create: {
				userId: session.user.id,
				equipmentId: equipmentId,
				quantity: quantity,
			},
		});

		revalidatePath("/checkout");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Ошибка БД" };
	}
}

// ── Удаление одного элемента ──
export async function deleteServerCartItemAction(
	equipmentId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) return { success: false, error: "Unauthorized" };

		await prisma.cartItem.deleteMany({
			where: { userId: session.user.id, equipmentId },
		});

		revalidatePath("/checkout");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Ошибка БД" };
	}
}

// ── Очистка всей корзины ──
export async function clearServerCartAction(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) return { success: false, error: "Unauthorized" };

		await prisma.cartItem.deleteMany({
			where: { userId: session.user.id },
		});

		revalidatePath("/checkout");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Ошибка БД" };
	}
}
