import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Rentacamera",
	description: "Best place for rent equipment",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
