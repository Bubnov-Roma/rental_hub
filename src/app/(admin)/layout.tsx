import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	const isAdmin = user?.app_metadata?.role === "admin";

	if (!user || !isAdmin) {
		redirect("/dashboard");
	}
	return (
		<div className="flex min-h-screen bg-gray-50">
			<AdminSidebar />
			<div className="flex-1">
				<AdminHeader />
				<main className="p-6">{children}</main>
			</div>
		</div>
	);
}
