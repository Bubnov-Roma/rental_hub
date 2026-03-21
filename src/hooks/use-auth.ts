"use client";

import { useSession } from "next-auth/react";

interface UserProfile {
	id: string;
	name: string | null | undefined;
	email: string | null | undefined;
	image: string | null | undefined;
	role: string;
	nickname?: string | undefined;
	companyName?: string | undefined;
	phone?: string | undefined;
	extraPhone?: string | undefined;
}

export function useAuth() {
	const { data: session, status, update } = useSession();
	const isLoading = status === "loading";
	const user = session?.user;

	const profile: UserProfile | null = user
		? {
				id: user.id || "",
				name: user.name,
				email: user.email,
				image: user.image,
				role: user.role || "USER",
				nickname: user.nickname ?? "",
				companyName: user.companyName ?? "",
				phone: user.phone ?? "",
				extraPhone: user.extraPhone ?? "",
			}
		: null;

	return {
		user: user
			? {
					id: user.id || "",
					email: user.email,
					name: user.name,
					image: user.image,
					user_metadata: {
						name: user.name,
						avatar_url: user.image,
						nickname: user.nickname,
						company_name: user.companyName,
						phone: user.phone,
						extra_phone: user.extraPhone,
					},
				}
			: null,
		profile,
		isLoading,
		isAuthenticated: status === "authenticated",
		refreshProfile: update,
	};
}
