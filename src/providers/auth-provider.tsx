"use client";

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

// Синглтон на уровне модуля — один объект на всё время жизни страницы.
const supabase = createClient();

export function AuthProvider({
	children,
	initialUser,
}: {
	children: ReactNode;
	initialUser: User | null;
}) {
	// Инициализируем user из SSR-данных — не ждём getSession на клиенте.
	const [user, setUser] = useState<User | null>(initialUser);
	const [profile, setProfile] = useState<Profile | null>(null);
	// Если initialUser уже есть — profile ещё грузится (isLoading=true).
	// Если нет — уже готово (isLoading=false).
	const [isLoading, setIsLoading] = useState(!!initialUser);

	// Защита от двойного запуска в React Strict Mode (dev).
	// useRef не вызывает re-render при изменении.
	const fetchingRef = useRef(false);

	const fetchProfile = useCallback(async (userId: string) => {
		// Дедупликация: если уже идёт запрос — не запускаем второй.
		if (fetchingRef.current) return;
		if (!userId) return;

		if (typeof window !== "undefined" && !window.navigator.onLine) {
			console.warn("Offline: skipping profile fetch");
			setIsLoading(false);
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
				} else {
					throw error;
				}
			} else {
				setProfile(data as Profile);
			}
		} catch (err) {
			const errMsg = getErrorMessage(err);
			if (errMsg.includes("Failed to fetch") || !window.navigator.onLine) {
				toast.error("Проблемы с интернетом, проверьте соединение");
			} else {
				setProfile(null);
			}
		} finally {
			fetchingRef.current = false;
			setIsLoading(false);
		}
	}, []); // нет deps — supabase и fetchingRef стабильны

	const refreshProfile = useCallback(async () => {
		if (user) {
			fetchingRef.current = false; // сбрасываем guard для ручного обновления
			await fetchProfile(user.id);
		}
	}, [user, fetchProfile]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <ONLY FOR MOUTHING>
	useEffect(() => {
		let mounted = true;

		// Если initialUser уже есть из SSR — НЕ вызываем getSession повторно,
		// просто грузим profile. Это убирает лишний round-trip к Supabase.
		if (initialUser) {
			fetchProfile(initialUser.id);
		} else {
			// Гость: нужно подписаться на auth state, но getSession не нужен —
			// initialUser уже null (передан из layout SSR).
			setIsLoading(false);
		}

		// Подписка на изменения auth state (логин/логаут/обновление токена).
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			if (!mounted) return;

			const newUser = session?.user ?? null;

			if (event === "SIGNED_IN") {
				setUser(newUser);
				if (newUser) {
					fetchingRef.current = false;
					await fetchProfile(newUser.id);
				}
			} else if (event === "TOKEN_REFRESHED") {
				// Токен обновился — user не менялся, profile не нужно перезагружать.
				setUser(newUser);
			} else if (event === "SIGNED_OUT") {
				setUser(null);
				setProfile(null);
				setIsLoading(false);
				invalidateFavoritesCache();
			}
			// INITIAL_SESSION игнорируем — initialUser уже пришёл из SSR.
		});

		return () => {
			mounted = false;
			subscription.unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<AuthContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
			{children}
		</AuthContext.Provider>
	);
}
