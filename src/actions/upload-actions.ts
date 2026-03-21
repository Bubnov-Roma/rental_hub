"use server";

import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import type {
	DbRawCSVRow,
	EquipmentStatus,
} from "@/core/domain/entities/Equipment";
import { prisma } from "@/lib/prisma";

// ── УДАЛЕНИЕ ФАЙЛА ИЗ FS И БД ──
export async function deleteImageAction(
	imageId: string,
	imageUrl: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) return { success: false, error: "Unauthorized" };

		// 1. Delete from Database
		// Check if it's a valid UUID before trying to delete from DB
		const isRealUUID =
			/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
				imageId
			);

		if (isRealUUID) {
			await prisma.image.delete({ where: { id: imageId } });
		}

		// 2. Delete from File System
		// Expecting URL like: /uploads/equipment/123-abc.jpg
		if (imageUrl.startsWith("/uploads/")) {
			const relativePath = imageUrl.replace("/uploads/", "");
			const fullPath = join(process.cwd(), "public", "uploads", relativePath);

			try {
				await unlink(fullPath);
			} catch {
				console.warn(
					"File not found on disk or could not be deleted:",
					fullPath
				);
			}
		}

		revalidatePath("/admin/equipment");
		return { success: true };
	} catch (error: unknown) {
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Ошибка удаления" };
	}
}

// ── СОХРАНЕНИЕ СВЯЗИ ИЗОБРАЖЕНИЯ И ОБОРУДОВАНИЯ ──
export async function linkImageToEquipmentAction(
	equipmentId: string,
	imageUrl: string
): Promise<{ id: string; url: string; error?: string }> {
	try {
		const session = await auth();
		if (!session?.user?.id) throw new Error("Unauthorized");

		// Generate a hash or unique identifier for the image if needed.
		// For simplicity, we'll just let Prisma generate the ID.
		const image = await prisma.image.create({
			data: {
				url: imageUrl,
				// If you need a hash, you should calculate it on the client before upload or here.
				// For now, we omit it or set it to something unique.
				hash: imageUrl,
			},
		});

		await prisma.equipmentImageLink.create({
			data: {
				equipmentId,
				imageId: image.id,
			},
		});

		revalidatePath("/admin/equipment");
		return { id: image.id, url: image.url };
	} catch (error: unknown) {
		console.error(error);
		throw new Error("Failed to link image");
	}
}

// ── ИМПОРТ CSV ──
export async function importEquipmentCSVAction(
	data: DbRawCSVRow[]
): Promise<{ success: boolean; count?: number; error?: string }> {
	try {
		const session = await auth();

		if (session?.user?.role !== "ADMIN" && session?.user?.role !== "MANAGER") {
			return { success: false, error: "Unauthorized" };
		}

		// Используем транзакцию для upsert всех записей
		const results = await prisma.$transaction(
			data.map((item) =>
				prisma.equipment.upsert({
					where: { slug: item.slug },
					update: {
						title: item.title,
						description: item.description,
						categoryId: item.categoryId,
						inventoryNumber: item.inventoryNumber,
						deposit: item.deposit,
						replacementValue: item.replacementValue,
						pricePerDay: item.pricePerDay,
						price4h: item.price4h,
						price8h: item.price8h,
						status: item.status as EquipmentStatus,
						isAvailable: item.isAvailable,
					},
					create: {
						title: item.title,
						slug: item.slug,
						description: item.description,
						categoryId: item.categoryId,
						inventoryNumber: item.inventoryNumber,
						deposit: item.deposit,
						replacementValue: item.replacementValue,
						pricePerDay: item.pricePerDay,
						price4h: item.price4h,
						price8h: item.price8h,
						status: item.status as EquipmentStatus,
						isAvailable: item.isAvailable,
					},
				})
			)
		);

		revalidatePath("/admin/equipment");
		return { success: true, count: results.length };
	} catch (error: unknown) {
		console.error("Import error:", error);
		if (error instanceof Error) return { success: false, error: error.message };
		return { success: false, error: "Ошибка импорта" };
	}
}
