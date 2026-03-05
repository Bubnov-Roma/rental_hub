import type { ClientFormValues, IndividualClient } from "@/schemas";

// ── Type guard ────────────────────────────────────────────────────────────────
// ClientFormValues = IndividualClient (schema is not a union anymore),
// but the guard is kept so future types (legal, partner) can be added back
// without touching every call-site.

export function isIndividualClient(
	data: ClientFormValues | null
): data is IndividualClient {
	return data?.clientType === "individual";
}

// ── Display data ──────────────────────────────────────────────────────────────

export type ClientDisplayData = {
	name: string;
	email: string;
	phone: string;
	birth: string;
	passport: string;
	isPartner: false;
	socials: Array<{ url: string }>;
};

export function getClientDisplayData(
	data: ClientFormValues | null
): ClientDisplayData | null {
	if (!data || !isIndividualClient(data)) return null;

	const { personalData, passport, contacts } = data.applicationData;

	return {
		name: personalData?.name ?? "",
		email: personalData?.email ?? "",
		phone: personalData?.phone ?? "",
		birth: personalData?.birth ?? "",
		passport: passport?.seriesAndNumber ?? "",
		isPartner: false,
		socials: contacts?.socials ?? [],
	};
}
