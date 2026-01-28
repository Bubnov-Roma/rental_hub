"use client";

import { RadarAnimation } from "@/components/forms/verification";
import { useApplicationStore } from "@/store";

export const VerificationRadar = () => {
	const status = useApplicationStore((state) => state.status);

	return (
		<div className="flex flex-col space-y-8 py-12">
			<RadarAnimation status={status} />
		</div>
	);
};
