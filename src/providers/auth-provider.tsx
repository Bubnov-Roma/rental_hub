"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
	user: User | null;
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
	const router = useRouter();
	const [user, setUser] = useState<User | null>(initialUser);
	const supabase = createClient();

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_OUT") {
				setUser(null);
				router.refresh();
			} else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
				setUser(session?.user ?? null);
			}
		});

		return () => subscription.unsubscribe();
	}, [supabase, router]);

	return (
		<AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
	);
}
