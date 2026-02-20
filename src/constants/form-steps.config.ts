import type { LucideIcon } from "lucide-react";
import { MapPin, MessageSquare, User } from "lucide-react";
import type { FieldPath } from "react-hook-form";
import {
	AddressesSection,
	ContactsSection,
	IdentitySection,
} from "@/components/forms/client-forms/client-types/sections/individual";

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
		component: ContactsSection,
		fields: ["applicationData.contacts"],
		availableFor: ["individual", "individual_partner"],
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
	return INDIVIDUAL_STEPS;
};
