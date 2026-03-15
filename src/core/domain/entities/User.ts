export type UserRole = "user" | "partner" | "manager" | "admin";
export type EntityType = "individual" | "legal_entity";

export type ApplicationStatus =
	| "loading"
	| "no_application"
	| "draft"
	| "pending"
	| "reviewing"
	| "clarification"
	| "standard"
	| "approved"
	| "rejected"
	| "blocked";

export interface UserApplication {
	id: string;
	status: ApplicationStatus;
	client_type: string;
	created_at: string;
	updated_at: string;
	rejection_reason: string | null;
}

export interface UserProfile {
	id: string;
	email: string | null;
	name: string | null;
	phone: string | null;
	avatar_url: string | null;
	role: UserRole;
	entity_type: EntityType | null;
	company_name: string | null;
	tin: string | null;
	created_at: string;
	is_blocked: boolean;
	blocked_reason: string | null;
	permissions: Record<string, boolean>;
	is_verified: boolean | null;
	// Enriched by admin page — not in DB
	application?: UserApplication | null;
}
