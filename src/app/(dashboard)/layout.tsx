import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		redirect("/auth/login");
	}

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex-1">
				<div className="container mx-auto p-6">{children}</div>
			</div>
		</div>
	);
}
