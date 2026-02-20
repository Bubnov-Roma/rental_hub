import type { Status } from "@/core/domain/entities/Booking";
import type { Equipment } from "@/core/domain/entities/Equipment";

export interface BookingsEquipment {
	title: string;
	category: string;
}

export interface BookingItem {
	id: string;
	equipment: BookingsEquipment;
	price_at_booking: number;
}
export interface Booking {
	equipment: Equipment;
	deposit_at_booking: number;
	price_at_booking: number;
	readonly id: string;
	readonly user_id: string; // В БД через подчеркивание
	readonly start_date: string; // Supabase возвращает дату как строку IO
	readonly end_date: string;
	readonly total_amount: number;
	readonly status: Status;
	readonly created_at: string;
	readonly insurance_included: boolean;
	readonly total_replacement_value: number;
	readonly booking_items?: {
		price_at_booking: number;
		deposit_at_booking: number;
		replacement_value_at_booking: number;
		equipment: Equipment;
	}[];
}
