import { createClient } from "@supabase/supabase-js";
import { PrismaClient, Prisma } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const prisma = new PrismaClient();

async function migrate() {
  console.log("🚀 Начинаем миграцию данных из Supabase в Prisma...");

  try {
    // 1. Миграция Категорий
    console.log("--- Категории ---");
    const { data: categories } = await supabase.from("categories").select("*");
    if (categories) {
      for (const cat of categories) {
        await prisma.category.upsert({
          where: { id: cat.id },
          update: {},
          create: {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
          },
        });
      }
      console.log(`✅ Перенесено категорий: ${categories.length}`);
    }

    // 2. Миграция Подкатегорий
    console.log("--- Подкатегории ---");
    const { data: subcategories } = await supabase.from("subcategories").select("*");
    if (subcategories) {
      for (const sub of subcategories) {
        await prisma.subcategory.upsert({
          where: { id: sub.id },
          update: {},
          create: {
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            categoryId: sub.category_id,
          },
        });
      }
      console.log(`✅ Перенесено подкатегорий: ${subcategories.length}`);
    }

    // 3. Миграция Изображений
    console.log("--- Изображения ---");
    const { data: images } = await supabase.from("images").select("*");
    if (images) {
      for (const img of images) {
        await prisma.image.upsert({
          where: { id: img.id },
          update: {},
          create: {
            id: img.id,
            url: img.url,
          },
        });
      }
      console.log(`✅ Перенесено изображений: ${images.length}`);
    }

    // 4. Миграция Оборудования (Equipment)
    console.log("--- Оборудование ---");
    const { data: equipment } = await supabase.from("equipment").select("*");
    if (equipment) {
      for (const item of equipment) {
        await prisma.equipment.upsert({
          where: { id: item.id },
          update: {},
          create: {
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category, // В Supabase это было поле category
            subcategory: item.subcategory,
            inventoryNumber: item.inventory_number,
            pricePerDay: Number(item.price_per_day),
            price4h: Number(item.price_4h),
            price8h: Number(item.price_8h),
            deposit: Number(item.deposit),
            replacementValue: Number(item.replacement_value),
            isAvailable: item.is_available,
            status: item.status,
            ownershipType: item.ownership_type,
            partnerName: item.partner_name,
            defects: item.defects,
            kitDescription: item.kit_description,
            // relatedIds: item.related_ids || [],
            specifications: (item.specifications as Prisma.InputJsonValue) || Prisma.JsonNull,
            comments: (item.comments as Prisma.InputJsonValue) || Prisma.JsonNull,
            slug: item.slug,
            isPrimary: item.is_primary ?? false,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at),
          },
        });
      }
      console.log(`✅ Перенесено позиций оборудования: ${equipment.length}`);
    }

    // 5. Миграция связей Оборудование-Картинки
    console.log("--- Связи изображений ---");
    const { data: links } = await supabase.from("equipment_image_links").select("*");
    if (links) {
      for (const link of links) {
        await prisma.equipmentImageLink.upsert({
          where: {
            equipmentId_imageId: {
              equipmentId: link.equipment_id,
              imageId: link.image_id,
            },
          },
          update: {},
          create: {
            equipmentId: link.equipment_id,
            imageId: link.image_id,
            orderIndex: link.order_index ?? 0,
          },
        });
      }
      console.log(`✅ Перенесено связей изображений: ${links.length}`);
    }

    console.log("\n🎉 Миграция успешно завершена!");
  } catch (error) {
    console.error("\n❌ Ошибка при миграции:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();