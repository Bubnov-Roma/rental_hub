import { createClient } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";
import * as dotenv from "dotenv";
import { prisma } from "../src/lib/prisma";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Supabase хранит статусы строчными буквами, Prisma — enum ВЕРХНИМ регистром
const STATUS_MAP: Record<string, string> = {
  available:   "AVAILABLE",
  rented:      "RENTED",
  reserved:    "RESERVED",
  maintenance: "MAINTENANCE",
  broken:      "BROKEN",
  retired:     "RETIRED",
};

const OWNERSHIP_MAP: Record<string, string> = {
  internal: "INTERNAL",
  sublease: "SUBLEASE",
};

async function migrate() {
  console.log("🚀 Начинаем миграцию данных из Supabase в Prisma...\n");

  try {
    // ── 1. Категории ────────────────────────────────────────────────────────
    console.log("--- Категории ---");
    const { data: categories } = await supabase.from("categories").select("*");
    if (categories) {
      for (const cat of categories) {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: {
            name:       cat.name,
            iconName:   cat.icon_name   ?? "Package",
            sortOrder:  cat.sort_order  ?? 0,
            adminNotes: cat.admin_notes ?? null,
            imageUrl:   cat.image_url   ?? null,
            isModular:  cat.is_modular  ?? false,
          },
          create: {
            id:         cat.id,
            name:       cat.name,
            slug:       cat.slug,
            iconName:   cat.icon_name   ?? "Package",
            sortOrder:  cat.sort_order  ?? 0,
            adminNotes: cat.admin_notes ?? null,
            imageUrl:   cat.image_url   ?? null,
            isModular:  cat.is_modular  ?? false,
          },
        });
      }
      console.log(`✅ Категорий: ${categories.length}`);
    }

    // ── 2. Подкатегории ─────────────────────────────────────────────────────
    console.log("\n--- Подкатегории ---");
    const { data: subcategories } = await supabase.from("subcategories").select("*");
    if (subcategories) {
      const usedSlugs = new Set<string>();
      for (const sub of subcategories) {
        let slug = sub.slug;
        let counter = 1;
        while (usedSlugs.has(slug)) slug = `${sub.slug}-${counter++}`;
        usedSlugs.add(slug);

        await prisma.subcategory.upsert({
          where: { id: sub.id },
          update: {
            name:       sub.name,
            categoryId: sub.category_id,
            sortOrder:  sub.sort_order  ?? 0,
            adminNotes: sub.admin_notes ?? null,
            imageUrl:   sub.image_url   ?? null,
          },
          create: {
            id:         sub.id,
            name:       sub.name,
            slug,
            categoryId: sub.category_id,
            sortOrder:  sub.sort_order  ?? 0,
            adminNotes: sub.admin_notes ?? null,
            imageUrl:   sub.image_url   ?? null,
          },
        });
      }
      console.log(`✅ Подкатегорий: ${subcategories.length}`);
    }

    // ── 3. Изображения ──────────────────────────────────────────────────────
    console.log("\n--- Изображения ---");
    const { data: images } = await supabase.from("images").select("*");
    if (images) {
      for (const img of images) {
        await prisma.image.upsert({
          where:  { id: img.id },
          update: { url: img.url, hash: img.hash ?? null },
          create: { id: img.id, url: img.url, hash: img.hash ?? null },
        });
      }
      console.log(`✅ Изображений: ${images.length}`);
    }

    // ── 4. Оборудование ─────────────────────────────────────────────────────
    // ИСПРАВЛЕНИЕ ОШИБКИ:
    //   В Supabase `category` и `subcategory` — UUID строки.
    //   В новой схеме Prisma это relation-поля (categoryId / subcategoryId).
    //   Нельзя передать строку напрямую — нужен синтаксис { connect: { id } }.
    console.log("\n--- Оборудование ---");
    const { data: equipment } = await supabase.from("equipment").select("*");

    if (equipment) {
      let ok = 0;
      let skipped = 0;

      for (const item of equipment) {
        if (!item.slug) {
          console.warn(`⚠️  Пропущено (нет slug): "${item.title}" (${item.id})`);
          skipped++;
          continue;
        }

        // Убеждаемся что categoryId уже перенесён
        const catExists = await prisma.category.findUnique({
          where: { id: item.category },
          select: { id: true },
        });
        if (!catExists) {
          console.warn(`⚠️  Пропущено (category не найдена: ${item.category}): "${item.title}"`);
          skipped++;
          continue;
        }

        // subcategory опциональна
        let subcategoryConnect: { connect: { id: string } } | undefined;
        if (item.subcategory) {
          const subExists = await prisma.subcategory.findUnique({
            where: { id: item.subcategory },
            select: { id: true },
          });
          if (subExists) {
            subcategoryConnect = { connect: { id: item.subcategory } };
          } else {
            console.warn(`⚠️  subcategory ${item.subcategory} не найдена для "${item.title}" — будет null`);
          }
        }

        await prisma.equipment.upsert({
          where: { id: item.id },
          // При повторном запуске — не трогаем уже перенесённые записи
          update: {},
          create: {
            id:               item.id,
            title:            item.title,
            slug:             item.slug,
            description:      item.description       ?? null,
            inventoryNumber:  item.inventory_number  ?? null,
            pricePerDay:      Number(item.price_per_day),
            price4h:          Number(item.price_4h          ?? 0),
            price8h:          Number(item.price_8h          ?? 0),
            deposit:          Number(item.deposit            ?? 0),
            replacementValue: Number(item.replacement_value ?? 0),
            isAvailable:      item.is_available ?? true,
            isPrimary:        item.is_primary   ?? false,
            // ✅ Enum-маппинг: "rented" → "RENTED"
            status:        (STATUS_MAP[item.status]            ?? "AVAILABLE") as any,
            ownershipType: (OWNERSHIP_MAP[item.ownership_type] ?? "INTERNAL")  as any,
            partnerName:      item.partner_name    ?? null,
            defects:          item.defects         ?? null,
            kitDescription:   item.kit_description ?? null,
            specifications:   (item.specifications as Prisma.InputJsonValue) ?? Prisma.JsonNull,
            comments:         (item.comments       as Prisma.InputJsonValue) ?? Prisma.JsonNull,
            createdAt:        new Date(item.created_at),
            updatedAt:        new Date(item.updated_at ?? item.created_at),
            // ✅ Главное исправление: relation через connect
            category: { connect: { id: item.category } },
            ...(subcategoryConnect ? { subcategory: subcategoryConnect } : {}),
          },
        });
        ok++;
      }

      console.log(`✅ Перенесено оборудования: ${ok}`);
      if (skipped) console.log(`⚠️  Пропущено: ${skipped}`);
    }

    // ── 5. Связи изображений ────────────────────────────────────────────────
    console.log("\n--- Связи изображений ---");
    const { data: links } = await supabase.from("equipment_image_links").select("*");
    if (links) {
      let ok = 0;
      let skipped = 0;

      for (const link of links) {
        const [equipExists, imgExists] = await Promise.all([
          prisma.equipment.findUnique({ where: { id: link.equipment_id }, select: { id: true } }),
          prisma.image.findUnique({ where: { id: link.image_id }, select: { id: true } }),
        ]);

        if (!equipExists || !imgExists) { skipped++; continue; }

        await prisma.equipmentImageLink.upsert({
          where: {
            equipmentId_imageId: {
              equipmentId: link.equipment_id,
              imageId:     link.image_id,
            },
          },
          update: {},
          create: {
            equipmentId: link.equipment_id,
            imageId:     link.image_id,
            orderIndex:  link.order_index ?? 0,
          },
        });
        ok++;
      }

      console.log(`✅ Связей изображений: ${ok}`);
      if (skipped) console.log(`⚠️  Пропущено связей (equipment или image не найдены): ${skipped}`);
    }

    console.log("\n🎉 Миграция успешно завершена!");
  } catch (error) {
    console.error("\n❌ Критическая ошибка:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();