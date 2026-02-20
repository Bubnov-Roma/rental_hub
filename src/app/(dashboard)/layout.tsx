import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

	return (
		<div className="min-h-screen">
			<div className="flex">
				<main className="flex-1 overflow-y-auto">{children}</main>
			</div>
		</div>
	);
}
