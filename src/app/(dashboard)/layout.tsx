import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// 1. Инициализируем клиент Supabase на сервере
	const supabase = await createClient();

	// 2. Получаем пользователя.
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	// 3. Если пользователя нет или произошла ошибка — мгновенный редирект
	if (error || !user) {
		redirect("/auth/login");
	}

	return (
		<div className="flex min-h-screen">
			<Sidebar user={user} />
			<div className="flex-1">
				<div className="container mx-auto p-6">{children}</div>
			</div>
		</div>
	);
}
