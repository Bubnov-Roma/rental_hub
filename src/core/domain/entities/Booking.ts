import type { Equipment } from "@/core/domain/entities/Equipment";

export type Status =
	| "pending"
	| "confirmed"
	| "active"
	| "completed"
	| "cancelled";

export interface Booking {
	readonly id: string;
	readonly userId: string;
	readonly equipmentId: string;
	readonly equipment?: Equipment;
	readonly startDate: Date;
	readonly endDate: Date;
	readonly totalAmount: number;
	readonly status: Status;
	readonly createdAt: Date;
	readonly user?: {
		readonly name: string | null;
		readonly email: string | null;
	};
}
