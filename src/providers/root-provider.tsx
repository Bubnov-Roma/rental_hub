"use client";

import type { User } from "@supabase/supabase-js";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-provider";
import { UnsavedChangesGuard } from "@/providers/unsaved-changes-guard";

interface RootProviderProps {
	children: React.ReactNode;
	initialUser: User | null;
}

export function RootProvider({ children, initialUser }: RootProviderProps) {
	return (
		<AuthProvider initialUser={initialUser}>
			<QueryProvider>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<UnsavedChangesGuard />
					<SidebarProvider>
						{children}
						<Toaster
							position="bottom-left"
							expand={false}
							richColors
							closeButton
						/>
					</SidebarProvider>
				</ThemeProvider>
			</QueryProvider>
		</AuthProvider>
	);
}
