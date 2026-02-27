import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
import { AppSidebar } from "@/components/layouts/AppSidebar";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";
import { MobileNavBar } from "@/components/layouts/MobileNavBar";
import { SidebarInset } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { ApplicationInitializer } from "@/providers/application-initializer";
import { RootProvider } from "@/providers/root-provider";
import "./globals.css";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	// Один запрос getUser на весь layout — результат передаётся в AppSidebar через props.
	// AppSidebar больше НЕ делает собственный getUser/getProfile.
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Параллельно: profile + initialApp (не последовательно!)
	const [profileResult, appResult] = await Promise.all([
		user
			? supabase.from("profiles").select("role").eq("id", user.id).single()
			: Promise.resolve({ data: null }),
		user
			? supabase
					.from("client_applications")
					.select("*")
					.eq("user_id", user.id)
					.maybeSingle()
			: Promise.resolve({ data: null }),
	]);

	const role = profileResult.data?.role ?? null;
	const isAdmin = role === "admin" || role === "manager";
	const initialApp = appResult.data;

	return (
		<html lang="ru" suppressHydrationWarning>
			<meta name="apple-mobile-web-app-title" content="Linza" />
			<body>
				<NextTopLoader color="#3b82f6" showSpinner={false} />
				<RootProvider initialUser={user}>
					{user ? (
						<ApplicationInitializer userId={user.id} initialData={initialApp}>
							{/* Props пробрасываем — AppSidebar не делает свой getUser */}
							<AppSidebar isAdmin={isAdmin} isLoggedIn={!!user} />
							<SidebarInset className="flex flex-col min-h-screen">
								<Header />
								<main className="flex-1">{children}</main>
								<Footer />
								<MobileNavBar />
							</SidebarInset>
						</ApplicationInitializer>
					) : (
						<>
							<AppSidebar isAdmin={false} isLoggedIn={!!user} />
							<SidebarInset className="flex flex-col min-h-screen">
								<Header />
								<main className="flex-1">{children}</main>
								<Footer />
								<MobileNavBar />
							</SidebarInset>
						</>
					)}
				</RootProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}
