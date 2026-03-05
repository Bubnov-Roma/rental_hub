import type { ClientFormValues } from "@/schemas";

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

export type ClientVariants =
	| "individual"
	| "individual_partner"
	| "legal"
	| "legal_partner";

export type AllowedUpdateField =
	| "applicationData.personalData.name"
	| "applicationData.personalData.phone"
	| "applicationData.passport.seriesAndNumber"
	| "applicationData.passport.issueDate"
	| "applicationData.passport.issuedBy"
	| "applicationData.addresses.registration"
	| "applicationData.addresses.actual"
	| "applicationData.addresses.isSame";

export type UserRole = "guest" | "user" | "admin" | "manager";

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
