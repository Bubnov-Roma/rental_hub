"use client";

import { ProfileDetails } from "@/components/dashboard/profile/ProfileDetails";
import { ClientForm } from "@/components/forms";
import { RainbowSpinner } from "@/components/shared";
import { useApplicationStore } from "@/store";
import type { ClientApplication } from "@/types";

interface ProfileViewClientProps {
	initialData?: ClientApplication | null;
	userId?: string;
}

export const ProfileViewClient: React.FC<ProfileViewClientProps> = () => {
	const applicationData = useApplicationStore((state) => state.applicationData);
	const status = useApplicationStore((state) => state.status);

	if (status === "loading") {
		return <RainbowSpinner />;
	}

	return (
		<div className="relative min-h-screen">
			{status === "no_application" ? (
				<ClientForm />
			) : (
				<ProfileDetails data={applicationData} />
			)}
		</div>
	);
};
