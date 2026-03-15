`use client`;

import type { User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { invalidateFavoritesCache } from "@/hooks";
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

const CACHE_KEY = "linza:profile";

interface CacheEntry {
	userId: string;
	profile: Profile;
}

function readCache(userId: string): Profile | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(CACHE_KEY);
		if (!raw) return null;
		const entry = JSON.parse(raw) as CacheEntry;
		return entry.userId === userId ? entry.profile : null;
	} catch {
		return null;
	}
}

function writeCache(userId: string, profile: Profile): void {
	try {
		sessionStorage.setItem(
			CACHE_KEY,
			JSON.stringify({ userId, profile } satisfies CacheEntry)
		);
	} catch {}
}

function clearCache(): void {
	try {
		sessionStorage.removeItem(CACHE_KEY);
	} catch {}
}

const supabase = createClient();

export function AuthProvider({
	children,
	initialUser,
}: {
	children: ReactNode;
	initialUser: User | null;
}) {
	const [user, setUser] = useState<User | null>(initialUser);

	// Читаем кеш прямо в инициализаторе useState — он вызывается только
	// на клиенте, поэтому sessionStorage доступен.
	// Если кеш есть → profile уже не null при первом рендере → нет спиннера.
	const [profile, setProfile] = useState<Profile | null>(() =>
		initialUser ? readCache(initialUser.id) : null
	);

	// isLoading=true только если есть юзер, но нет кешированного профиля.
	// Если кеш есть → сразу false → аватар виден мгновенно.
	const [isLoading, setIsLoading] = useState(
		Boolean(initialUser) && readCache(initialUser?.id ?? "") === null
	);

	const fetchingRef = useRef(false);

	const fetchProfile = useCallback(async (userId: string, silent = false) => {
		if (fetchingRef.current || !userId) return;
		if (typeof window !== "undefined" && !window.navigator.onLine) {
			if (!silent) setIsLoading(false);
			return;
		}

		fetchingRef.current = true;
		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", userId)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					setProfile(null);
					clearCache();
				} else {
					throw error;
				}
			} else {
				const fresh = data as Profile;
				setProfile(fresh);
				writeCache(userId, fresh);
			}
		} catch (err) {
			const msg = getErrorMessage(err);
			if (msg.includes("Failed to fetch") || !window.navigator.onLine) {
				toast.error("Проблемы с интернетом, проверьте соединение");
			} else if (!silent) {
				setProfile(null);
			}
		} finally {
			fetchingRef.current = false;
			setIsLoading(false);
		}
	}, []);

	const refreshProfile = useCallback(async () => {
		if (user) {
			fetchingRef.current = false;
			await fetchProfile(user.id);
		}
	}, [user, fetchProfile]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only on mount
	useEffect(() => {
		let mounted = true;

		if (initialUser) {
			const hasCached = readCache(initialUser.id) !== null;
			fetchProfile(initialUser.id, hasCached);
		} else {
			setIsLoading(false);
		}

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (!mounted) return;
			const newUser = session?.user ?? null;

			if (event === "SIGNED_IN") {
				setUser(newUser);
				if (newUser) {
					const cached = readCache(newUser.id);
					if (cached) {
						setProfile(cached);
						setIsLoading(false);
					}
					fetchingRef.current = false;
					await fetchProfile(newUser.id, !!cached);
				}
			} else if (event === "TOKEN_REFRESHED") {
				setUser(newUser);
			} else if (event === "SIGNED_OUT") {
				setUser(null);
				setProfile(null);
				setIsLoading(false);
				clearCache();
				invalidateFavoritesCache();
			}
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
			{children}
		</AuthContext.Provider>
	);
}
