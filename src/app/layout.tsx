import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-provider";
import { UnsavedChangesGuard } from "@/providers/unsaved-changes-guard";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
	title: "Linza",
	description: "Best place for rent equipment",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<html lang="ru" suppressHydrationWarning>
			<body className={inter.className}>
				<NextTopLoader
					color="#3b82f6"
					initialPosition={0.08}
					crawlSpeed={200}
					height={3}
					showSpinner={false}
					easing="ease"
					speed={200}
					shadow="0 0 15px #3b82f6, 0 0 10px #3b82f6"
				/>
				<AuthProvider initialUser={user}>
					<QueryProvider>
						<ThemeProvider
							attribute="class"
							defaultTheme="system"
							enableSystem
							disableTransitionOnChange
						>
							<UnsavedChangesGuard />
							<Header />
							<main className="flex-1">{children}</main>
							<Footer />
							<Toaster
								position="bottom-left"
								expand={false}
								richColors
								closeButton
							/>
						</ThemeProvider>
					</QueryProvider>
				</AuthProvider>
			</body>
		</html>
	);
}
