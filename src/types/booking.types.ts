/**
 * booking.types.ts
 *
 * Типы выведены вручную из реальной схемы БД (без зависимости от supabase gen).
 * Каждое поле соответствует точному типу PostgreSQL колонки.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Статусы
// ─────────────────────────────────────────────────────────────────────────────

export type BookingStatus =
	| "pending_review" // ждёт проверки менеджером
	| "wait_payment" // ждёт ынесения предоплаты
	| "ready_to_rent" // бронь подтверждена
	| "active" // выдан в аренду
	| "completed" // завершен
	| "cancelled" // отменен
	| "expired"; // устарел

// ─────────────────────────────────────────────────────────────────────────────
// Equipment snippets — только поля из SELECT, не весь equipment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Список заказов.
 * SELECT: equipment(title, category, price_4h, price_8h, price_per_day)
 *
 * DB: numeric → number | null (Supabase JS driver возвращает number)
 *     price_4h / price_8h — numeric DEFAULT 0, но могут быть null в старых записях
 */
export interface BookingEquipmentSnippet {
	title: string;
	category: string;
	price_4h: number | null;
	price_8h: number | null;
	price_per_day: number;
}

/**
 * Детальная страница — superset списка.
 * SELECT: equipment(id, title, category, price_4h, price_8h, price_per_day, deposit)
 */
export interface BookingEquipmentDetailSnippet extends BookingEquipmentSnippet {
	id: string; // uuid
	deposit: number | null; // numeric DEFAULT 0
}

// ─────────────────────────────────────────────────────────────────────────────
// booking_items
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Список заказов.
 * SELECT: id, price_at_booking, deposit_at_booking,
 *         replacement_value_at_booking, equipment(…snippet…)
 *
 * DB: price_at_booking numeric NOT NULL
 *     deposit_at_booking numeric DEFAULT 0
 *     replacement_value_at_booking numeric DEFAULT 0
 */
export interface BookingItemRow {
	id: string;
	price_at_booking: number;
	deposit_at_booking: number;
	replacement_value_at_booking: number;
	equipment: BookingEquipmentSnippet;
	/** Заполняется на клиенте после резолва изображений — не колонка БД */
	imageUrl?: string | null;
}

/**
 * Детальная страница.
 * equipment | null — защита от удалённого FK
 */
export interface BookingItemDetailRow {
	id: string;
	price_at_booking: number;
	deposit_at_booking: number;
	replacement_value_at_booking: number;
	equipment: BookingEquipmentDetailSnippet | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking shapes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Список заказов — /dashboard/bookings
 * SELECT: id, user_id, start_date, end_date, total_amount, status,
 *         created_at, total_replacement_value, insurance_included,
 *         booking_items(…)
 *
 * DB types:
 *   id / user_id                 uuid       → string
 *   start_date / end_date        timestamptz → string (ISO)
 *   total_amount                 double precision → number
 *   total_replacement_value      numeric DEFAULT 0 → number | null
 *   insurance_included           boolean DEFAULT true → boolean | null
 *   status                       text → BookingStatus
 */
export interface BookingRow {
	id: string;
	user_id: string;
	start_date: string;
	end_date: string;
	total_amount: number;
	status: BookingStatus;
	created_at: string;
	total_replacement_value: number | null;
	insurance_included: boolean | null;
	booking_items: BookingItemRow[];
}

/**
 * Детальная страница — /dashboard/bookings/[id]
 * Расширяет BookingRow тремя полями:
 *   updated_at          timestamptz DEFAULT now() → string | null
 *   cancellation_reason text                      → string | null
 *   cancelled_at        timestamptz               → string | null
 *
 * booking_items переопределён на BookingItemDetailRow (superset).
 */
export interface BookingDetailRow extends Omit<BookingRow, "booking_items"> {
	updated_at: string | null;
	cancellation_reason: string | null;
	cancelled_at: string | null;
	booking_items: BookingItemDetailRow[];
}

// ─── Dashboard-specific narrow types ─────────────────────────────────────────
// These match exactly what the Supabase query returns — no casts needed.

export interface DashboardEquipment {
	title: string;
	// imageUrl comes from equipment_image_links → images
}

export interface DashboardBooking {
	id: string;
	start_date: string;
	end_date: string;
	total_amount: number;
	status: string;
	created_at: string;
	booking_items: DashboardBookingItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Narrow helpers — изолируют cast в одном месте, убирают as unknown as из page
// ─────────────────────────────────────────────────────────────────────────────
//
// Пример в page.tsx:
//   const { data: raw } = await supabase.from("bookings").select(`…`).single();
//   if (!raw) notFound();
//   const booking = toBookingDetailRow(raw);

export function toBookingDetailRow(
	raw: NonNullable<unknown>
): BookingDetailRow {
	return raw as BookingDetailRow;
}

export function toBookingRow(raw: NonNullable<unknown>): BookingRow {
	return raw as BookingRow;
}

export function toBookingRowArray(raw: NonNullable<unknown>[]): BookingRow[] {
	return raw as BookingRow[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DashboardBooking — расширение BookingRow для страницы дашборда.
// Отличие: booking_items содержат imageUrl (обязательное, резолвится на клиенте).
// ─────────────────────────────────────────────────────────────────────────────

/** booking_items с обязательным imageUrl — после client-side резолва */
export interface DashboardBookingItem {
	equipment: DashboardEquipment;
	price_at_booking: number;
	/** First image URL extracted from equipment_image_links */
	imageUrl: string | null;
}

/**
 * Хелпер для конвертации BookingRow → DashboardBooking
 * (imageUrl будет null пока не зарезолвится)
 */
export function toDashboardBooking(row: BookingRow): DashboardBooking {
	return {
		...row,
		booking_items: row.booking_items.map((item) => ({
			...item,
			imageUrl: item.imageUrl ?? null,
		})),
	};
}

// ─────────────────────────────────────────────────────────────────────────────
// Переход на автоматические типы (когда будет готово)
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Генерация:
//    npx supabase gen types typescript --project-id=<id> > src/types/supabase.ts
//    Добавить в package.json: "gen:types": "supabase gen types typescript ..."
//
// 2. После генерации Pick<> заменит примитивы:
//    type BookingDbRow = Database["public"]["Tables"]["bookings"]["Row"];
//    id: BookingDbRow["id"]  ← вместо string
//
// 3. Лучший вариант — QueryData, 100% вывод из строки запроса:
//    import type { QueryData } from "@supabase/supabase-js";
//    const q = supabase.from("bookings").select(`id, ..., booking_items(...)`);
//    export type BookingDetailRow = QueryData<typeof q>;
