import type { LucideIcon } from "lucide-react";
import {
	Banknote,
	Briefcase,
	Building,
	CheckCircle2,
	FileText,
	MapPin,
	MessageSquare,
	User,
} from "lucide-react";
import type { FieldPath } from "react-hook-form";
// Individual
import {
	AddressesSection,
	ContactsBlock,
	ExpertiseSection,
	FinalsSection,
	IdentitySection,
} from "@/components/forms/client-forms/client-types/sections/individual";
// Legal
import {
	BankDetailsSection,
	CompanySection,
	ContactPersonSection,
	DirectorSection,
	LegalAddressesSection,
	LegalAgreementsBlock,
} from "@/components/forms/client-forms/client-types/sections/legal";

import type { ClientFormValues } from "@/schemas";
import type { ClientVariants } from "@/types";

export interface StepConfig {
	id: string;
	label: string;
	title: string;
	icon: LucideIcon;
	component: React.ComponentType;
	fields: FieldPath<ClientFormValues>[];
	availableFor: Array<ClientVariants>;
}

// ============================================================================
// INDIVIDUAL STEPS
// ============================================================================
export const INDIVIDUAL_STEPS: readonly StepConfig[] = [
	{
		id: "identity",
		label: "Профиль",
		title: "Личные данные и паспорт",
		icon: User,
		component: IdentitySection,
		fields: ["applicationData.personalData", "applicationData.passport"],
		availableFor: ["individual", "individual_partner"],
	},
	{
		id: "location",
		label: "Адреса",
		title: "Адреса регистрации и проживания",
		icon: MapPin,
		component: AddressesSection,
		fields: ["applicationData.addresses"],
		availableFor: ["individual", "individual_partner"],
	},
	{
		id: "contacts",
		label: "Связь",
		title: "Контактная информация",
		icon: MessageSquare,
		component: ContactsBlock,
		fields: ["applicationData.contacts"],
		availableFor: ["individual", "individual_partner"],
	},
	{
		id: "professional",
		label: "Работа",
		title: "Опыт и профессиональная деятельность",
		icon: Briefcase,
		component: ExpertiseSection,
		fields: ["additional.work", "additional.experience"],
		availableFor: ["individual", "individual_partner"],
	},
	{
		id: "finalize",
		label: "Завершение",
		title: "Завершение регистрации",
		icon: CheckCircle2,
		component: FinalsSection,
		fields: ["additional.referralSource"],
		availableFor: ["individual", "individual_partner"],
	},
] as const;

// ============================================================================
// LEGAL STEPS
// ============================================================================
export const LEGAL_STEPS: readonly StepConfig[] = [
	{
		id: "company",
		label: "Компания",
		title: "Данные организации",
		icon: Building,
		component: CompanySection,
		fields: ["company", "details"],
		availableFor: ["legal", "legal_partner"],
	},
	{
		id: "director",
		label: "Руководитель",
		title: "Информация о руководителе",
		icon: User,
		component: DirectorSection,
		fields: ["director"],
		availableFor: ["legal", "legal_partner"],
	},
	{
		id: "addresses",
		label: "Адреса",
		title: "Юридический и фактический адреса",
		icon: MapPin,
		component: LegalAddressesSection,
		fields: ["address"],
		availableFor: ["legal", "legal_partner"],
	},
	{
		id: "bank",
		label: "Банк",
		title: "Банковские реквизиты",
		icon: Banknote,
		component: BankDetailsSection,
		fields: ["bankDetails"],
		availableFor: ["legal", "legal_partner"],
	},
	{
		id: "contact-person",
		label: "Контактное лицо",
		title: "Контактное лицо организации",
		icon: FileText,
		component: ContactPersonSection,
		fields: ["contactPerson"],
		availableFor: ["legal", "legal_partner"],
	},
	{
		id: "finalize",
		label: "Завершение",
		title: "Завершение регистрации",
		icon: CheckCircle2,
		component: LegalAgreementsBlock,
		fields: ["agreements"],
		availableFor: ["legal", "legal_partner"],
	},
] as const;

// ============================================================================
// HELPER FUNCTION - Получить шаги для конкретного типа клиента
// ============================================================================
export const getStepsForClientType = (
	clientType: ClientFormValues["clientType"]
): readonly StepConfig[] => {
	if (clientType === "individual" || clientType === "individual_partner") {
		return INDIVIDUAL_STEPS;
	}

	if (clientType === "legal" || clientType === "legal_partner") {
		return LEGAL_STEPS;
	}

	return INDIVIDUAL_STEPS;
};
