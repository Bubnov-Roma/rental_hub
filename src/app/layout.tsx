import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
	title: "Rentacamera",
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
		<html lang="ru">
			<body className={inter.className}>
				<div className="flex min-h-screen flex-col">
					<Header user={user} />
					<main className="flex-1">{children}</main>
					<Footer />
					<Toaster position="top-right" expand={false} richColors closeButton />
				</div>
			</body>
		</html>
	);
}
