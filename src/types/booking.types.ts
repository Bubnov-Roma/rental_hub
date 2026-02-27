// ─── Derived from the Supabase schema ────────────────────────────────────────

export type BookingStatus =
	| "pending"
	| "confirmed"
	| "active"
	| "completed"
	| "cancelled";

export interface BookingEquipment {
	title: string;
	category: string;
	price_4h: number | null;
	price_8h: number | null;
	price_per_day: number;
}

export interface BookingItemRow {
	id: string;
	price_at_booking: number;
	deposit_at_booking: number;
	replacement_value_at_booking: number;
	equipment: BookingEquipment;
}

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
