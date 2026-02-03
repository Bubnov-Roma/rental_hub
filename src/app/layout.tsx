import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
import { AppSidebar } from "@/components/layouts/AppSidebar";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";
import { SidebarInset } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { RootProvider } from "@/providers/root-provider";
import "./globals.css";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<html lang="ru" suppressHydrationWarning>
			<body>
				<NextTopLoader color="#3b82f6" showSpinner={false} />
				<RootProvider initialUser={user}>
					<AppSidebar />
					<SidebarInset className="flex flex-col min-h-screen">
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</SidebarInset>
				</RootProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}
