import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	const userId = session?.user.id;

	if (!userId) {
		redirect("/auth/login");
	}
	return <>{children}</>;
}
