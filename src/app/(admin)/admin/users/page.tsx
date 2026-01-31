import UsersTable from "@/components/admin/UsersTable";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
	const supabase = await createClient();

	const { data: profiles } = await supabase
		.from("profiles")
		.select("*")
		.order("created_at", { ascending: false });

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
				<p className="mt-2 text-gray-600">
					Управление доступом и ролями ({profiles?.length || 0} аккаунтов)
				</p>
			</div>
			<UsersTable initialUsers={profiles || []} />
		</div>
	);
}
