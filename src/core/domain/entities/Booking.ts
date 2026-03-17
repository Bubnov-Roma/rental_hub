import type { DbEquipment } from "@/core/domain/entities/Equipment";

export type Status =
	| "PENDING"
	| "CONFIRMED"
	| "ACTIVE"
	| "COMPLETED"
	| "CANCELED";

export interface Booking {
	readonly id: string;
	readonly userId: string;
	readonly equipmentId: string;
	readonly equipment?: DbEquipment;
	readonly startDate: Date;
	readonly endDate: Date;
	readonly totalAmount: number;
	readonly status: Status;
	readonly createdAt: Date;
	readonly price_at_booking: number;
	readonly user?: {
		readonly name: string | null;
		readonly email: string | null;
	};
}
