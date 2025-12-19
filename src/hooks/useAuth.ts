"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadUser() {
			setIsLoading(true);
			const currentUser = await getCurrentUser();
			setUser(currentUser);
			setIsLoading(false);
		}

		loadUser();

		// Subscribe to changes in authentication state
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			if (session?.user) {
				const userData = await getCurrentUser();
				setUser(userData);
			} else {
				setUser(null);
			}
			setIsLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return { user, isLoading };
}
