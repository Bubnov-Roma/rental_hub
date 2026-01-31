import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { ApplicationInitializer } from "@/providers/application-initializer";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login");
	}

	const { data: initialApp } = await supabase
		.from("client_applications")
		.select("*")
		.eq("user_id", user.id)
		.maybeSingle();

	return (
		<div className="min-h-screen">
			<ApplicationInitializer userId={user.id} initialData={initialApp}>
				<div className="flex">
					<Sidebar />
					<main className="flex-1 overflow-y-auto">{children}</main>
				</div>
			</ApplicationInitializer>
		</div>
	);
}
