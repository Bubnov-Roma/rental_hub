"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// ─── FAQ CRUD ─────────────────────────────────────────────────────────────────

export type DbFaqItem = {
	id: string;
	question: string;
	answer: string;
	sortOrder: number;
	category: string | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export async function getFaqItemsAction(): Promise<DbFaqItem[]> {
	const data = await prisma.faqItem.findMany({
		orderBy: { sortOrder: "asc" },
	});
	return data;
}

export async function createFaqItemAction(data: {
	question: string;
	answer: string;
	category?: string;
}): Promise<{ success: boolean; item?: DbFaqItem; error?: string }> {
	try {
		const last = await prisma.faqItem.findFirst({
			orderBy: { sortOrder: "desc" },
			select: { sortOrder: true },
		});

		const created = await prisma.faqItem.create({
			data: {
				question: data.question.trim(),
				answer: data.answer.trim(),
				category: data.category ?? null,
				sortOrder: (last?.sortOrder ?? 0) + 1,
			},
		});

		revalidatePath("/faq");
		revalidatePath("/admin");
		return { success: true, item: created };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Неизвестная ошибка" };
	}
}

export async function updateFaqItemAction(
	id: string,
	data: Partial<
		Pick<
			DbFaqItem,
			"question" | "answer" | "category" | "isActive" | "sortOrder"
		>
	>
): Promise<{ success: boolean; error?: string }> {
	try {
		await prisma.faqItem.update({
			where: { id },
			data, // Так как ключи в data совпадают с полями модели Prisma, можно передать напрямую
		});

		revalidatePath("/faq");
		revalidatePath("/admin");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Неизвестная ошибка" };
	}
}

export async function deleteFaqItemAction(
	id: string
): Promise<{ success: boolean; error?: string }> {
	try {
		await prisma.faqItem.delete({ where: { id } });

		revalidatePath("/faq");
		revalidatePath("/admin");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Неизвестная ошибка" };
	}
}

export async function reorderFaqItemsAction(
	orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
	try {
		await prisma.$transaction(
			orderedIds.map((id, index) =>
				prisma.faqItem.update({
					where: { id },
					data: { sortOrder: index + 1 },
				})
			)
		);

		revalidatePath("/faq");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Неизвестная ошибка" };
	}
}
