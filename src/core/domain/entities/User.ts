export type UserRole = "user" | "partner" | "manager" | "admin";
export type EntityType = "individual" | "legal_entity";

export interface UserProfile {
	id: string;
	email: string | null;
	name: string | null;
	phone: string | null;
	avatar_url: string | null;
	role: UserRole;
	entity_type: EntityType;
	company_name: string | null;
	tin: string | null;
	created_at: string;
}
