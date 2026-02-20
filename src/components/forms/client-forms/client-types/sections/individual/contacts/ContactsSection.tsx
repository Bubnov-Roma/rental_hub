"use client";

import { FinalsSection } from "@/components/forms/client-forms/client-types/sections/individual/final/FinalsSection";
import {
	SectionColumn,
	SectionWrapper,
} from "@/components/forms/client-forms/shared";
import { SocialsSection } from "./SocialsSection";

export const ContactsSection = () => {
	return (
		<SectionWrapper className="lg:grid-cols-2">
			<SectionColumn title="Мессенджеры и соцсети" indicatorColor="bg-sky-400">
				<SocialsSection />
			</SectionColumn>
			<SectionColumn title="Как вы о нас узнали" indicatorColor="bg-rose-500">
				<FinalsSection />
			</SectionColumn>
		</SectionWrapper>
	);
};
