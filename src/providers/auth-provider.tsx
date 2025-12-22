"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, type ReactNode, useState } from "react";

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
	const [user] = useState<User | null>(initialUser);

	return (
		<AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
	);
}
