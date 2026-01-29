import type { ClientFormValues } from "@/schemas";

export type ApplicationStatus =
	| "pending"
	| "reviewing"
	| "clarification"
	| "standard"
	| "approved"
	| "loading"
	| "no_application"
	| "rejected";

export type ClientVariants =
	| "individual"
	| "individual_partner"
	| "legal"
	| "legal_partner";

export interface ClientApplication {
	id: string;
	user_id: string;
	client_type: ClientFormValues;
	application_data: ClientFormValues;
	status: ApplicationStatus;
	rejection_reason?: string;
	created_at: string;
	updated_at: string;
}
