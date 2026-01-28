"use client";
import { EmergencyCard } from "@/components/forms/client-forms/client-types/sections/individual/contacts/EmergencyCard";

export const EmergencySection = () => {
	return (
		<div className="grid grid-cols-1 md:grid-cols-1 gap-1">
			{[0, 1].map((index) => (
				<EmergencyCard key={index} index={index} orientation="vertical" />
			))}
		</div>
	);
};
