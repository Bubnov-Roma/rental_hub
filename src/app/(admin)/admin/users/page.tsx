import UsersTable from "@/components/admin/users/UsersTable";
import type { UserProfile } from "@/core/domain/entities/User";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
	const supabase = await createClient();

	// ── Fetch all profiles ──────────────────────────────────────────────────
	// Requires RLS policy "Admins can view all profiles" from migration_admin_access_v3.sql
	const { data: profiles, error } = await supabase
		.from("profiles")
		.select(
			"id, name, email, phone, avatar_url, role, entity_type, company_name, tin, created_at, is_blocked, blocked_reason, permissions, is_verified"
		)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("[AdminUsersPage] profiles query error:", error.message);
	}

	// ── Fetch all client_applications for enrichment ────────────────────────
	const { data: applications } = await supabase
		.from("client_applications")
		.select(
			"id, user_id, status, client_type, created_at, updated_at, rejection_reason"
		);

	const appByUserId = Object.fromEntries(
		(applications ?? []).map((a) => [a.user_id, a])
	);

	const enriched: UserProfile[] = (profiles ?? []).map((p) => ({
		...p,
		permissions: (p.permissions ?? {}) as Record<string, boolean>,
		application: appByUserId[p.id] ?? null,
	}));

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-3xl font-black italic uppercase tracking-tight">
					Пользователи
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Управление доступом и ролями · {enriched.length} аккаунтов
				</p>
			</div>
			<UsersTable initialUsers={enriched} />
		</div>
	);
}
