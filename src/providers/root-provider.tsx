"use client";

import type { User } from "@supabase/supabase-js";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
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
		<NuqsAdapter>
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
								position="top-center"
								expand={false}
								richColors
								closeButton
							/>
						</SidebarProvider>
					</ThemeProvider>
				</QueryProvider>
			</AuthProvider>
		</NuqsAdapter>
	);
}
