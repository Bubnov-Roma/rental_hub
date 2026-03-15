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
import { getCategoriesFromDb } from "@/actions/category-actions";

export const viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#fff6f5" },
		{ media: "(prefers-color-scheme: dark)", color: "#111016" },
	],
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();

	const [
		{
			data: { user },
		},
		categories,
	] = await Promise.all([supabase.auth.getUser(), getCategoriesFromDb()]);

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
			<head>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="Linza" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
			</head>
			<body>
				<NextTopLoader color="#3b82f6" showSpinner={false} />
				<RootProvider initialUser={user}>
					{user ? (
						<ApplicationInitializer userId={user.id} initialData={initialApp}>
							<AppSidebar isAdmin={isAdmin} />
							<SidebarInset className="flex flex-col min-h-screen">
								<Header categories={categories} />
								<main className="flex-1 pt-16">{children}</main>
								<Footer />
								<MobileNavBar categories={categories} />
							</SidebarInset>
						</ApplicationInitializer>
					) : (
						<>
							<AppSidebar isAdmin={false} />
							<SidebarInset className="flex flex-col min-h-screen">
								<Header categories={categories} />
								<main className="flex-1 pt-16">{children}</main>
								<Footer />
								<MobileNavBar categories={categories} />
							</SidebarInset>
						</>
					)}
				</RootProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}
