export type VerificationStatus =
	| "pending"
	| "reviewing"
	| "clarification"
	| "standard"
	| "approved";

export type ApplicationStatus =
	| VerificationStatus
	| "loading"
	| "no_application";

export type ClientVariants =
	| "individual"
	| "individual_partner"
	| "legal"
	| "legal_partner";
