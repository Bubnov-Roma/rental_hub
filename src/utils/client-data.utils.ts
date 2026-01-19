import type {
	ClientFormValues,
	EquipmentSchemaType,
	IndividualClient,
	IndividualPartner,
	LegalClient,
	LegalPartner,
} from "@/schemas/client.schema";

// ============================================================================
// TYPE GUARDS
// ============================================================================

export type AnyIndividualClient = IndividualClient | IndividualPartner;
export type AnyLegalClient = LegalClient | LegalPartner;

export function isAnyIndividual(
	data: ClientFormValues
): data is AnyIndividualClient {
	return (
		data.clientType === "individual" || data.clientType === "individual_partner"
	);
}

export function isAnyLegal(data: ClientFormValues): data is AnyLegalClient {
	return data.clientType === "legal" || data.clientType === "legal_partner";
}

export function isIndividualClient(
	data: ClientFormValues
): data is IndividualClient {
	return data.clientType === "individual";
}

export function isIndividualPartner(
	data: ClientFormValues
): data is IndividualPartner {
	return data.clientType === "individual_partner";
}

export function isLegalClient(data: ClientFormValues): data is LegalClient {
	return data.clientType === "legal";
}

export function isLegalPartner(data: ClientFormValues): data is LegalPartner {
	return data.clientType === "legal_partner";
}

// ============================================================================
// DISPLAY DATA TYPES
// ============================================================================

type BaseDisplayData = {
	clientType: ClientFormValues["clientType"];
	name: string;
	email: string;
	phone: string;
};

type IndividualDisplayData = BaseDisplayData & {
	category: "individual";
	passport: string;
	birth: string;
	maritalStatus: "single" | "married";
	inn: null;
	companyName: null;
	// Партнерские поля
	isPartner: boolean;
	partnerEquipment?: Array<EquipmentSchemaType>;
	partnerAgreement?: boolean;
};

type LegalDisplayData = BaseDisplayData & {
	category: "legal";
	inn: string;
	companyName: string;
	companyType: "ip" | "ooo" | "nko" | "ao";
	passport: null;
	birth: null;
	maritalStatus: null;
	// Партнерские поля
	isPartner: boolean;
	partnerEquipment?: Array<EquipmentSchemaType>;
	partnerAgreement?: boolean;
};

export type ClientDisplayData = IndividualDisplayData | LegalDisplayData;

// ============================================================================
// EXTRACTORS
// ============================================================================

const extractIndividualClient = (
	data: IndividualClient
): IndividualDisplayData => ({
	clientType: data.clientType,
	category: "individual",
	isPartner: false,
	name: data.applicationData.personalData.name,
	email: data.applicationData.personalData.email,
	phone: data.applicationData.personalData.phone,
	passport: data.applicationData.passport.seriesAndNumber,
	birth: data.applicationData.personalData.birth,
	maritalStatus: data.applicationData.personalData.maritalStatus,
	inn: null,
	companyName: null,
});

const extractIndividualPartner = (
	data: IndividualPartner
): IndividualDisplayData => ({
	clientType: data.clientType,
	category: "individual",
	isPartner: true,
	name: data.applicationData.personalData.name,
	email: data.applicationData.personalData.email,
	phone: data.applicationData.personalData.phone,
	passport: data.applicationData.passport.seriesAndNumber,
	birth: data.applicationData.personalData.birth,
	maritalStatus: data.applicationData.personalData.maritalStatus,
	inn: null,
	companyName: null,
	partnerEquipment: data.partnerEquipment,
	partnerAgreement: data.partnerAgreement,
});

const extractLegalClient = (data: LegalClient): LegalDisplayData => ({
	clientType: data.clientType,
	category: "legal",
	isPartner: false,
	name: data.company.companyName,
	email: data.company.companyEmail,
	phone: data.company.companyPhone,
	inn: data.details.inn,
	companyName: data.company.companyName,
	companyType: data.company.companyType,
	passport: null,
	birth: null,
	maritalStatus: null,
});

const extractLegalPartner = (data: LegalPartner): LegalDisplayData => ({
	clientType: data.clientType,
	category: "legal",
	isPartner: true,
	name: data.company.companyName,
	email: data.company.companyEmail,
	phone: data.company.companyPhone,
	inn: data.details.inn,
	companyName: data.company.companyName,
	companyType: data.company.companyType,
	passport: null,
	birth: null,
	maritalStatus: null,
	partnerEquipment: data.partnerEquipment,
	partnerAgreement: data.partnerAgreement,
});

// ============================================================================
// MAIN UTILITY FUNCTION
// ============================================================================

export const getClientDisplayData = (
	data: ClientFormValues | null
): ClientDisplayData | null => {
	if (!data) return null;

	switch (data.clientType) {
		case "individual":
			return extractIndividualClient(data);
		case "individual_partner":
			return extractIndividualPartner(data);
		case "legal":
			return extractLegalClient(data);
		case "legal_partner":
			return extractLegalPartner(data);
		default:
			return null;
	}
};

// ============================================================================
// ADDITIONAL UTILITY FUNCTIONS
// ============================================================================

export const getRegistrationAddress = (
	data: ClientFormValues | null
): string | null => {
	if (!data) return null;

	if (isAnyIndividual(data)) {
		const address = data.applicationData.addresses.registration;
		return `${address.index ? `${address.index}, ` : ""}${address.country}, ${address.region}, ${address.city}, ${address.address}`;
	}

	if (isAnyLegal(data)) {
		const address = data.address.registration;
		return `${address.index ? `${address.index}, ` : ""}${address.country}, ${address.region}, ${address.city}, ${address.address}`;
	}

	return null;
};

export const getContactPerson = (
	data: ClientFormValues | null
): { name: string; email: string; phone: string } | null => {
	if (!data || !isAnyLegal(data)) return null;

	return {
		name: data.contactPerson.personalData.name,
		email: data.contactPerson.email,
		phone: data.contactPerson.phone,
	};
};

export const getSocialMedia = (
	data: ClientFormValues | null
): Array<{ platform: string; url: string }> | null => {
	if (!data || !isAnyIndividual(data)) return null;

	return data.applicationData.contacts.socials.map((social) => ({
		platform: social.platform,
		url: social.url,
	}));
};

export const getEmergencyContacts = (
	data: ClientFormValues | null
): Array<{ name: string; phone: string; relation?: string }> | null => {
	if (!data || !isAnyIndividual(data)) return null;

	return data.applicationData.contacts.emergency.map((contact) => ({
		name: contact.name,
		phone: contact.phone,
		relation: contact.relation ?? "",
	}));
};

export const getWorkInfo = (
	data: ClientFormValues | null
): {
	workplace: string;
	position?: string;
	monthlyIncome: string;
} | null => {
	if (!data || !isAnyIndividual(data)) return null;

	return {
		workplace: data.additional.work.workplace,
		position: data.additional.work.position ?? "",
		monthlyIncome: data.additional.work.monthlyIncome,
	};
};

export const isPartner = (data: ClientFormValues | null): boolean => {
	if (!data) return false;
	return (
		data.clientType === "individual_partner" ||
		data.clientType === "legal_partner"
	);
};

export const getPartnerEquipment = (
	data: ClientFormValues | null
): Array<EquipmentSchemaType> | null => {
	if (!data || !isPartner(data)) return null;

	if (isIndividualPartner(data) || isLegalPartner(data)) {
		return data.partnerEquipment;
	}
	return null;
};
