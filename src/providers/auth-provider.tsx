"use client";

import type { User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	useCallback,
	useEffect,
	useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/utils";

export type UserRole = "user" | "manager" | "admin";
export type EntityType = "individual" | "legal";

export interface Profile {
	id: string;
	name: string | null;
	email: string | null;
	avatar_url: string | null;
	role: UserRole;
	entity_type: EntityType;
	company_name: string | null;
	tin: string | null;
	is_verified: boolean;
	phone: string | null;
	registration_step: number;
}

interface AuthContextType {
	user: User | null;
	profile: Profile | null;
	isLoading: boolean;
	refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function AuthProvider({
	children,
	initialUser,
}: {
	children: ReactNode;
	initialUser: User | null;
}) {
	const [user, setUser] = useState<User | null>(initialUser);
	const [profile, setProfile] = useState<Profile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const supabase = createClient();

	const fetchProfile = useCallback(
		async (userId: string) => {
			if (!userId) return;

			try {
				const { data, error } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", userId)
					.single();

				if (error) {
					if (error.code === "PGRST116") {
						console.warn("Profile not found for user:", userId);
					} else {
						throw error;
					}
				}
				setProfile(data as Profile);
			} catch (err) {
				console.error("Error fetching profile:", getErrorMessage(err) || err);
				setProfile(null);
			} finally {
				setIsLoading(false);
			}
		},
		[supabase]
	);

	const refreshProfile = useCallback(async () => {
		if (user) await fetchProfile(user.id);
	}, [user, fetchProfile]);

	useEffect(() => {
		let mounted = true;
		const initAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!mounted) return;

			const currentUser = session?.user ?? null;
			setUser(currentUser);

			if (currentUser) {
				await fetchProfile(currentUser.id);
			} else {
				setIsLoading(false);
			}
		};

		initAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (!mounted) return;

			const newUser = session?.user ?? null;
			setUser(newUser);

			if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
				if (newUser) await fetchProfile(newUser.id);
			} else if (event === "SIGNED_OUT") {
				setProfile(null);
				setIsLoading(false);
			}
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, [fetchProfile, supabase]);

	return (
		<AuthContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
			{children}
		</AuthContext.Provider>
	);
}
