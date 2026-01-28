"use client";

import {
	SectionColumn,
	SectionWrapper,
} from "@/components/forms/client-forms/shared";
import { EmergencySection } from "./EmergencySection";
import { SocialsSection } from "./SocialsSection";

export const ContactsSection = () => {
	return (
		<SectionWrapper className="lg:grid-cols-2">
			<SectionColumn title="Мессенджеры и соцсети" indicatorColor="bg-sky-400">
				<SocialsSection />
			</SectionColumn>
			<SectionColumn title="Экстренная связь" indicatorColor="bg-rose-500">
				<EmergencySection />
			</SectionColumn>
		</SectionWrapper>
	);
};
